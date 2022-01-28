import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Tile from '@custom/shared/components/Tile';
import { DEFAULT_ASPECT_RATIO } from '@custom/shared/constants';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useTracks } from '@custom/shared/contexts/TracksProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { isLocalId } from '@custom/shared/contexts/participantsState';
import { useCamSubscriptions } from '@custom/shared/hooks/useCamSubscriptions';
import { useResize } from '@custom/shared/hooks/useResize';
import { useScrollbarWidth } from '@custom/shared/hooks/useScrollbarWidth';
import classnames from 'classnames';
import debounce from 'debounce';
import PropTypes from 'prop-types';

import { useBlockScrolling } from './useBlockScrolling';

/**
 * Gap between tiles in pixels.
 */
const GAP = 1;

/**
 * Maximum amount of buffered video tiles, in addition
 * to the visible on-screen tiles.
 */
const MAX_SCROLL_BUFFER = 10;

export const ParticipantBar = ({
  aspectRatio = DEFAULT_ASPECT_RATIO,
  fixed = [],
  others = [],
  width,
}) => {
  const { networkState } = useCallState();
  const {
    currentSpeaker,
    screens,
    swapParticipantPosition,
  } = useParticipants();
  const { maxCamSubscriptions } = useTracks();
  const { pinnedId, showParticipantsBar } = useUIState();
  const itemHeight = useMemo(() => width / aspectRatio + GAP, [
    aspectRatio,
    width,
  ]);
  const paddingTop = useMemo(() => itemHeight * fixed.length, [
    fixed,
    itemHeight,
  ]);
  const scrollTop = useRef(0);
  const spaceBefore = useRef(null);
  const spaceAfter = useRef(null);
  const scrollRef = useRef(null);
  const othersRef = useRef(null);
  const [range, setRange] = useState([0, 20]);
  const [isSidebarScrollable, setIsSidebarScrollable] = useState(false);
  const blockScrolling = useBlockScrolling(scrollRef);
  const scrollbarWidth = useScrollbarWidth();
  const hasScreenshares = useMemo(() => screens.length > 0, [screens]);
  const othersCount = useMemo(() => others.length, [others]);
  const visibleOthers = useMemo(() => others.slice(range[0], range[1]), [
    others,
    range,
  ]);
  const currentSpeakerId = useMemo(() => currentSpeaker?.id, [currentSpeaker]);

  /**
   * Store other ids as string to reduce amount of running useEffects below.
   */
  const otherIds = useMemo(() => others.map((o) => o?.id), [others]);

  const [camSubscriptions, setCamSubscriptions] = useState({
    subscribedIds: [],
    pausedIds: [],
  });
  useCamSubscriptions(
    camSubscriptions?.subscribedIds,
    camSubscriptions?.pausedIds
  );

  /**
   * Determines subscribed and paused participant ids,
   * based on rendered range, scroll position and viewport.
   */
  const updateCamSubscriptions = useCallback(
    (r) => {
      const scrollEl = scrollRef.current;
      const fixedRemote = fixed.filter((p) => !isLocalId(p.id));

      if (!showParticipantsBar) {
        setCamSubscriptions({
          subscribedIds: [
            currentSpeakerId,
            pinnedId,
            ...fixedRemote.map((p) => p.id),
          ],
          pausedIds: [],
        });
        return;
      }
      if (!scrollEl) return;

      /**
       * Make sure we don't accidentally end up with a negative buffer,
       * in case maxCamSubscriptions is lower than the amount of displayable
       * participants.
       */
      const buffer =
        Math.max(0, maxCamSubscriptions - (r[1] - r[0]) - fixedRemote.length) /
        2;
      const min = Math.max(0, r[0] - buffer);
      const max = Math.min(otherIds.length, r[1] + buffer);
      const ids = otherIds.slice(min, max);
      if (!ids.includes(currentSpeakerId) && !isLocalId(currentSpeakerId)) {
        ids.push(currentSpeakerId);
      }
      // Calculate paused participant ids by determining their tile position
      const subscribedIds = [...fixedRemote.map((p) => p.id), ...ids];
      const pausedIds = otherIds.filter((id, i) => {
        // ignore unrendered ids, they'll be unsubscribed instead
        if (!ids.includes(id)) return false;
        // ignore current speaker, it should never be paused
        if (id === currentSpeakerId) return false;
        const top = i * itemHeight;
        const fixedHeight = fixed.length * itemHeight;
        const visibleScrollHeight = scrollEl.clientHeight - fixedHeight;
        const paused =
          // bottom video edge above top viewport edge
          top + itemHeight < scrollEl.scrollTop ||
          // top video edge below bottom viewport edge
          top > scrollEl.scrollTop + visibleScrollHeight;
        return paused;
      });
      setCamSubscriptions({
        subscribedIds,
        pausedIds,
      });
    },
    [
      currentSpeakerId,
      fixed,
      itemHeight,
      maxCamSubscriptions,
      otherIds,
      pinnedId,
      showParticipantsBar,
    ]
  );

  /**
   * Updates
   * 1. the range of rendered others tiles
   * 2. the spacing boxes before and after the visible tiles
   */
  const updateVisibleRange = useCallback(
    (st) => {
      const visibleHeight = scrollRef.current.clientHeight - paddingTop;
      const scrollBuffer = Math.min(
        MAX_SCROLL_BUFFER,
        (2 * visibleHeight) / itemHeight
      );
      const visibleItemCount = Math.ceil(
        visibleHeight / itemHeight + scrollBuffer
      );
      let start = Math.floor(
        Math.max(0, st - (scrollBuffer / 2) * itemHeight) / itemHeight
      );
      const end = Math.min(start + visibleItemCount, othersCount);
      if (end - visibleItemCount < start) {
        // Make sure we always render the same amount of tiles and buffered tiles
        start = Math.max(0, end - visibleItemCount);
      }
      /**
       * updateVisibleRange is called while scrolling for every frame!
       * We're updating only one state to cause exactly one re-render.
       * Heights for spacer elements are set directly on the DOM to stay ⚡️ fast.
       */
      setRange([start, end]);
      if (!spaceBefore.current || !spaceAfter.current) return [start, end];
      spaceBefore.current.style.height = `${start * itemHeight}px`;
      spaceAfter.current.style.height = `${(othersCount - end) * itemHeight}px`;
      return [start, end];
    },
    [itemHeight, othersCount, paddingTop, spaceAfter, spaceBefore]
  );

  useResize(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    setIsSidebarScrollable(scrollEl?.scrollHeight > scrollEl?.clientHeight);
    const r = updateVisibleRange(scrollEl.scrollTop);
    updateCamSubscriptions(r);
  }, [
    scrollRef,
    showParticipantsBar,
    updateCamSubscriptions,
    updateVisibleRange,
  ]);

  /**
   * Setup optimized scroll listener.
   */
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return false;

    let frame;
    const handleScroll = () => {
      scrollTop.current = scrollEl.scrollTop;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!scrollEl) return;
        const r = updateVisibleRange(scrollEl.scrollTop);
        updateCamSubscriptions(r);
      });
    };

    scrollEl.addEventListener('scroll', handleScroll);
    return () => {
      scrollEl.removeEventListener('scroll', handleScroll);
    };
  }, [scrollRef, updateCamSubscriptions, updateVisibleRange]);

  /**
   * Move out-of-view active speakers to position right after presenters.
   */
  useEffect(() => {
    const scrollEl = scrollRef.current;
    // Ignore promoting, when no screens are being shared
    // because the active participant will be shown in the SpeakerTile anyway
    if (!hasScreenshares || !scrollEl) return false;

    const maybePromoteActiveSpeaker = () => {
      const fixedOther = fixed.find((f) => !f.isLocal);
      // Ignore when speaker is already at first position or component unmounted
      if (!fixedOther || fixedOther?.id === currentSpeakerId || !scrollEl) {
        return false;
      }

      // Active speaker not rendered at all, promote immediately
      if (
        visibleOthers.every((p) => p.id !== currentSpeakerId) &&
        !isLocalId(currentSpeakerId)
      ) {
        swapParticipantPosition(fixedOther.id, currentSpeakerId);
        return false;
      }

      const activeTile = othersRef.current?.querySelector(
        `[id="${currentSpeakerId}"]`
      );
      // Ignore when active speaker is not within "others"
      if (!activeTile) return false;

      // Ignore when active speaker is already pinned
      if (currentSpeakerId === pinnedId) return false;

      const { height: tileHeight } = activeTile.getBoundingClientRect();
      const othersVisibleHeight =
        scrollEl?.clientHeight - othersRef.current?.offsetTop;

      const scrolledOffsetTop = activeTile.offsetTop - scrollEl?.scrollTop;

      // Ignore when speaker is already visible (< 50% cut off)
      if (
        scrolledOffsetTop + tileHeight / 2 < othersVisibleHeight &&
        scrolledOffsetTop > -tileHeight / 2
      ) {
        return false;
      }

      return swapParticipantPosition(fixedOther.id, currentSpeakerId);
    };
    maybePromoteActiveSpeaker();
    const throttledHandler = debounce(maybePromoteActiveSpeaker, 100);
    scrollEl.addEventListener('scroll', throttledHandler);

    return () => {
      scrollEl?.removeEventListener('scroll', throttledHandler);
    };
  }, [
    currentSpeakerId,
    fixed,
    hasScreenshares,
    pinnedId,
    swapParticipantPosition,
    visibleOthers,
  ]);

  const otherTiles = useMemo(
    () =>
      visibleOthers.map((callItem) => (
        <Tile
          aspectRatio={aspectRatio}
          key={callItem.id}
          participant={callItem}
        />
      )),
    [aspectRatio, visibleOthers]
  );

  return (
    <div
      ref={scrollRef}
      className={classnames('sidebar', {
        blockScrolling,
        scrollable: isSidebarScrollable,
        scrollbarOutside: scrollbarWidth > 0,
      })}
    >
      <div className="fixed">
        {fixed.map((item, i) => {
          // reduce setting up & tearing down tiles as much as possible
          const key = i;
          return (
            <Tile
              key={key}
              aspectRatio={aspectRatio}
              participant={item}
              network={networkState}
            />
          );
        })}
      </div>
      {showParticipantsBar && (
        <div ref={othersRef} className="participants">
          <div ref={spaceBefore} style={{ width }} />
          {otherTiles}
          <div ref={spaceAfter} style={{ width }} />
        </div>
      )}
      <style jsx>{`
        .sidebar {
          border-left: 1px solid var(--blue-dark);
          flex: none;
          margin-left: 1px;
          overflow-x: hidden;
          overflow-y: auto;
        }
        .sidebar.blockScrolling {
          overflow-y: hidden;
        }
        .sidebar.blockScrolling.scrollbarOutside {
          background-color: red;
          padding-right: 12px;
        }
        .sidebar.scrollable:not(.scrollbarOutside) :global(.tile-actions) {
          right: 20px;
        }
        .sidebar .fixed {
          background: red;
          position: sticky;
          top: 0;
          z-index: 3;
        }
        .sidebar .participants {
          position: relative;
        }
        .sidebar :global(.tile) {
          border-top: ${GAP}px solid var(--blue-dark);
          width: ${width}px;
        }
        .sidebar .fixed :global(.tile:first-child) {
          border: none;
        }
      `}</style>
    </div>
  );
};

ParticipantBar.propTypes = {
  aspectRatio: PropTypes.number,
  fixed: PropTypes.array.isRequired,
  others: PropTypes.array.isRequired,
  width: PropTypes.number,
};

export default ParticipantBar;
