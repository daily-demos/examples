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
import { useCamSubscriptions } from '@custom/shared/hooks/useCamSubscriptions';
import { useResize } from '@custom/shared/hooks/useResize';
import { useScrollbarWidth } from '@custom/shared/hooks/useScrollbarWidth';
import { throttle } from '@custom/shared/lib/throttle';
import {
  useLocalParticipant,
  useNetwork,
  useScreenShare,
} from '@daily-co/daily-react-hooks';
import classnames from 'classnames';
import debounce from 'debounce';
import PropTypes from 'prop-types';

import { useActiveSpeaker } from '../../hooks/useActiveSpeaker';
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
  const { currentSpeakerId, swapParticipantPosition } = useParticipants();
  const { maxCamSubscriptions } = useTracks();
  const { pinnedId } = useUIState();
  const itemHeight = useMemo(
    () => width / aspectRatio + GAP,
    [aspectRatio, width]
  );
  const paddingTop = useMemo(
    () => itemHeight * fixed.length,
    [fixed, itemHeight]
  );
  const scrollTop = useRef(0);
  const spaceBefore = useRef(null);
  const spaceAfter = useRef(null);
  const scrollRef = useRef(null);
  const othersRef = useRef(null);
  const [range, setRange] = useState([0, 20]);
  const [isSidebarScrollable, setIsSidebarScrollable] = useState(false);
  const blockScrolling = useBlockScrolling(scrollRef);
  const scrollbarWidth = useScrollbarWidth();
  const activeSpeakerId = useActiveSpeaker();
  const { screens } = useScreenShare();

  const hasScreenshares = useMemo(() => screens.length > 0, [screens]);
  const othersCount = useMemo(() => others.length, [others]);
  const visibleOthers = useMemo(
    () => others.slice(range[0], range[1]),
    [others, range]
  );
  const localParticipant = useLocalParticipant();
  const { threshold } = useNetwork();

  /**
   * Determines whether or not to render the active speaker border.
   * Border should be omitted in 1-to-1 scenarios.
   */
  const shouldRenderSpeakerBorder = useMemo(
    () =>
      // Non-floating bar with at least 3 rendered participants
      fixed.length + others.length > 2 ||
      // Floating bar with more than 1 participant on shared screen
      (fixed.length > 1 && hasScreenshares),
    [fixed.length, hasScreenshares, others.length]
  );

  const [camSubscriptions, setCamSubscriptions] = useState({
    subscribedIds: [],
    stagedIds: [],
  });
  useCamSubscriptions(
    camSubscriptions?.subscribedIds,
    camSubscriptions?.stagedIds
  );

  /**
   * Determines subscribed and staged participant ids,
   * based on rendered range, scroll position and viewport.
   */
  const updateCamSubscriptions = useCallback(
    (range) => {
      const fixedRemote = fixed.filter(
        (id) => id !== localParticipant?.session_id
      );
      const scrollEl = scrollRef.current;

      // No participant bar = Subscribe to speaker & pinned only
      if (!scrollEl) {
        setCamSubscriptions({
          subscribedIds: [currentSpeakerId, pinnedId, ...fixedRemote],
          stagedIds: [],
        });
        return;
      }

      /**
       * Get list of participant ids being rendered or within scroll buffer.
       * Make sure we don't accidentally end up with a negative buffer,
       * in case maxCamSubscriptions is lower than the amount of displayable
       * participants.
       */
      const buffer =
        Math.max(
          0,
          maxCamSubscriptions - (range[1] - range[0]) - fixedRemote.length
        ) / 2;
      const min = Math.max(0, range[0] - buffer);
      const max = Math.min(others.length, range[1] + buffer);
      let renderedOrBufferedIds = others.slice(min, max);
      if (
        !renderedOrBufferedIds.includes(currentSpeakerId) &&
        currentSpeakerId !== localParticipant?.session_id
      ) {
        renderedOrBufferedIds.push(currentSpeakerId);
      }
      renderedOrBufferedIds = [...fixedRemote, ...renderedOrBufferedIds];

      // Determine whether to stage or subscribe to video tracks based on their
      // visibility.
      const stagedIds = others.filter((id, i) => {
        // ignore unrendered or unbuffered ids, they'll be unsubscribed instead
        if (!renderedOrBufferedIds.includes(id)) return false;
        // ignore current speaker, it should always be subscribed
        if (id === currentSpeakerId) return false;
        const top = i * itemHeight;
        const fixedHeight = fixed.length * itemHeight;
        const visibleScrollHeight = scrollEl.clientHeight - fixedHeight;
        const staged =
          // bottom video edge above top viewport edge
          top + itemHeight < scrollEl.scrollTop ||
          // top video edge below bottom viewport edge
          top > scrollEl.scrollTop + visibleScrollHeight;
        return staged;
      });
      const subscribedIds = renderedOrBufferedIds.filter(
        (id) => !stagedIds.includes(id)
      );
      setCamSubscriptions({
        subscribedIds,
        stagedIds,
      });
    },
    [
      currentSpeakerId,
      fixed,
      itemHeight,
      localParticipant?.session_id,
      maxCamSubscriptions,
      others,
      pinnedId,
    ]
  );

  /**
   * Updates
   * 1. the range of rendered others tiles
   * 2. the spacing boxes before and after the visible tiles
   */
  const updateVisibleRange = useCallback(
    (scrollTop) => {
      const visibleHeight = scrollRef.current.clientHeight - paddingTop;
      const scrollBuffer = Math.min(
        MAX_SCROLL_BUFFER,
        (2 * visibleHeight) / itemHeight
      );
      const visibleItemCount = Math.ceil(
        visibleHeight / itemHeight + scrollBuffer
      );
      let start = Math.floor(
        Math.max(0, scrollTop - (scrollBuffer / 2) * itemHeight) / itemHeight
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

  /**
   * WARNING: this resize event is critical for all subscriptions updates,
   * even those unrelated to resizing, due to its dependency on
   * updateCamSubscriptions causing it to trigger when anything changes
   * that might effect subscriptions, like changes in active speaker.
   *
   * It is required when showParticipantBar is true AND false.
   *
   * TODO: we may want to change this so subscriptions rely on a useEffect hook instead.
   */
  useResize(() => {
    const scrollEl = scrollRef.current;
    /**
     * No participant bar and/or no scroll area
     * We still have to call updateCamSubscriptions, otherwise we wouldn't subscribe to the speaker.
     */
    if (!scrollEl) {
      updateCamSubscriptions([0, 0]);
      return;
    }
    setIsSidebarScrollable(scrollEl?.scrollHeight > scrollEl?.clientHeight);
    const range = updateVisibleRange(scrollEl.scrollTop);
    updateCamSubscriptions(range);
  }, [scrollRef, updateCamSubscriptions, updateVisibleRange]);

  /**
   * Setup optimized scroll listener.
   */
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    let frame;
    const handleScroll = () => {
      scrollTop.current = scrollEl.scrollTop;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!scrollEl) return;
        const range = updateVisibleRange(scrollEl.scrollTop);
        updateCamSubscriptions(range);
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
    if (!hasScreenshares || !scrollEl) return;

    const maybePromoteActiveSpeaker = () => {
      const fixedOtherId = fixed.find(
        (id) => id !== localParticipant?.session_id
      );

      // Promote speaker when participant bar isn't rendered & screen is shared
      if (hasScreenshares && fixedOtherId) {
        swapParticipantPosition(fixedOtherId, activeSpeakerId);
        return;
      }

      // Ignore when speaker is already at first position or component unmounted
      if (!fixedOtherId || fixedOtherId === activeSpeakerId || !scrollEl)
        return;

      // Active speaker not rendered at all, promote immediately
      if (
        visibleOthers.every((id) => id !== activeSpeakerId) &&
        activeSpeakerId !== localParticipant?.session_id
      ) {
        swapParticipantPosition(fixedOtherId, activeSpeakerId);
        return;
      }

      const activeTile = othersRef.current?.querySelector(
        `[id="${activeSpeakerId}"]`
      );
      // Ignore when active speaker is not within "others"
      if (!activeTile) return;

      // Ignore when active speaker is already pinned
      if (activeSpeakerId === pinnedId) return;

      const { height: tileHeight } = activeTile.getBoundingClientRect();
      const othersVisibleHeight =
        scrollEl?.clientHeight - othersRef.current?.offsetTop;

      const scrolledOffsetTop = activeTile.offsetTop - scrollEl?.scrollTop;

      // Ignore when speaker is already visible (< 50% cut off)
      if (
        scrolledOffsetTop + tileHeight / 2 < othersVisibleHeight &&
        scrolledOffsetTop > -tileHeight / 2
      )
        return;

      swapParticipantPosition(fixedOtherId, activeSpeakerId);
    };
    maybePromoteActiveSpeaker();
    const throttledHandler = throttle(maybePromoteActiveSpeaker, 100);
    scrollEl.addEventListener('scroll', throttledHandler);
    return () => {
      scrollEl?.removeEventListener('scroll', throttledHandler);
    };
  }, [
    activeSpeakerId,
    fixed,
    hasScreenshares,
    localParticipant?.session_id,
    pinnedId,
    swapParticipantPosition,
    visibleOthers,
  ]);

  const otherTiles = useMemo(
    () =>
      visibleOthers.map((id) => (
        <Tile
          aspectRatio={aspectRatio}
          key={id}
          isSpeaking={shouldRenderSpeakerBorder && id === activeSpeakerId}
          sessionId={id}
        />
      )),
    [activeSpeakerId, aspectRatio, shouldRenderSpeakerBorder, visibleOthers]
  );

  if (fixed.length + others.length === 0 || fixed.length === 0) return null;

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
        {fixed.map((id, i) => {
          // reduce setting up & tearing down tiles as much as possible
          const key = i;
          return (
            <Tile
              key={key}
              aspectRatio={aspectRatio}
              sessionId={id}
              network={id === localParticipant?.sessionId ? threshold : null}
            />
          );
        })}
      </div>
      <div ref={othersRef} className="participants">
        <div ref={spaceBefore} style={{ width }} />
        {otherTiles}
        <div ref={spaceAfter} style={{ width }} />
      </div>
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