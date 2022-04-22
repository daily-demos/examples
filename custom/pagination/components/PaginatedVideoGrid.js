import React, {
  useRef,
  useMemo,
  useEffect,
  useState,
} from 'react';
import Button from '@custom/shared/components/Button';
import Tile from '@custom/shared/components/Tile';
import {
  DEFAULT_ASPECT_RATIO,
  MEETING_STATE_JOINED,
} from '@custom/shared/constants';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipantMetaData, useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useTracks } from '@custom/shared/contexts/TracksProvider';
import { useActiveSpeaker } from '@custom/shared/hooks/useActiveSpeaker';
import { useCamSubscriptions } from '@custom/shared/hooks/useCamSubscriptions';
import { ReactComponent as IconArrow } from '@custom/shared/icons/raquo-md.svg';
import PropTypes from 'prop-types';
import { useDeepCompareMemo, useDeepCompareEffect } from 'use-deep-compare';

// --- Constants

const MIN_TILE_WIDTH = 280;
const MAX_TILES_PER_PAGE = 12;

export const PaginatedVideoGrid = ({
  maxTilesPerPage = MAX_TILES_PER_PAGE,
}) => {
  const { callObject } = useCallState();
  const {
    participantCount,
    participantIds,
    localParticipant,
    swapParticipantPosition,
    orderedParticipantIds,
  } = useParticipants();
  const { maxCamSubscriptions } = useTracks();
  const participantMetaData = useParticipantMetaData();
  const activeSpeakerId = useActiveSpeaker();

  // Memoized participant count (does not include screen shares)
  const displayableParticipantCount = useMemo(
    () => participantCount,
    [participantCount]
  );

  // Grid size (dictated by screen size)
  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
  });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const gridRef = useRef(null);

  // -- Layout / UI

  // Update width and height of grid when window is resized
  useEffect(() => {
    let frame;
    const handleResize = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = gridRef.current?.clientWidth;
        const height = gridRef.current?.clientHeight;
        setDimensions({ width, height });
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Memoized reference to the max columns and rows possible given screen size
  const [maxColumns, maxRows] = useMemo(() => {
    const { width, height } = dimensions;
    const columns = Math.max(1, Math.floor(width / MIN_TILE_WIDTH));
    const widthPerTile = width / columns;
    const rows = Math.max(1, Math.floor(height / (widthPerTile * (9 / 16))));
    return [columns, rows];
  }, [dimensions]);

  // Memoized count of how many tiles can we show per page
  const pageSize = useMemo(
    () => Math.min(maxColumns * maxRows, maxTilesPerPage),
    [maxColumns, maxRows, maxTilesPerPage]
  );

  // Calc and set the total number of pages as participant count mutates
  useEffect(() => {
    setPages(Math.ceil(displayableParticipantCount / pageSize));
  }, [pageSize, displayableParticipantCount]);

  // Make sure we never see a blank page (if we're on the last page and people leave)
  useEffect(() => {
    if (page <= pages) return;
    setPage(pages);
  }, [page, pages]);

  // Brutishly calculate the dimensions of each tile given the size of the grid
  const [tileWidth, tileHeight] = useMemo(() => {
    const { width, height } = dimensions;
    const n = Math.min(pageSize, displayableParticipantCount);
    if (n === 0) return [width, height];
    const dims = [];
    for (let i = 1; i <= n; i += 1) {
      let maxWidthPerTile = (width - (i - 1)) / i;
      let maxHeightPerTile = maxWidthPerTile / DEFAULT_ASPECT_RATIO;
      const rows = Math.ceil(n / i);
      if (rows * maxHeightPerTile > height) {
        maxHeightPerTile = (height - (rows - 1)) / rows;
        maxWidthPerTile = maxHeightPerTile * DEFAULT_ASPECT_RATIO;
        dims.push([maxWidthPerTile, maxHeightPerTile]);
      } else {
        dims.push([maxWidthPerTile, maxHeightPerTile]);
      }
    }
    return dims.reduce(
      ([rw, rh], [w, h]) => {
        if (w * h < rw * rh) return [rw, rh];
        return [w, h];
      },
      [0, 0]
    );
  }, [dimensions, pageSize, displayableParticipantCount]);

  // -- Track subscriptions

  // Memoized array of participants on the current page (those we can see)
  const visibleParticipantIds = useMemo(
    () =>
      participantIds.length - page * pageSize > 0
        ? participantIds.slice((page - 1) * pageSize, page * pageSize)
        : participantIds.slice(-pageSize),
    [page, pageSize, participantIds]
  );

  /**
   * Play / pause tracks based on pagination
   * Note: we pause adjacent page tracks and unsubscribe from everything else
   */
  const camSubscriptions = useMemo(() => {
    const maxSubs = maxCamSubscriptions
      ? // avoid subscribing to only a portion of a page
      Math.max(maxCamSubscriptions, pageSize)
      : // if no maximum is set, subscribe to adjacent pages
      3 * pageSize;

    // Determine participant ids to subscribe to or stage, based on page.
    let renderedOrBufferedIds;
    switch (page) {
      // First page
      case 1:
        renderedOrBufferedIds = orderedParticipantIds.slice(
          0,
          Math.min(maxSubs, 2 * pageSize - 1)
        );
        break;
      // Last page
      case Math.ceil(orderedParticipantIds.length / pageSize):
        renderedOrBufferedIds = orderedParticipantIds.slice(
          -Math.min(maxSubs, 2 * pageSize)
        );
        break;
      // Any other page
      default:
      {
        const buffer = Math.floor((maxSubs - pageSize) / 2);
        const min = Math.max(0, (page - 1) * pageSize - buffer);
        const max = Math.min(
          orderedParticipantIds.length,
          page * pageSize + buffer
        );
        renderedOrBufferedIds = orderedParticipantIds.slice(min, max);
      }
        break;
    }

    const subscribedIds = [];
    const stagedIds = [];

    // Decide whether to subscribe to or stage participants' track based on
    // visibility
    for (const id of renderedOrBufferedIds) {
      if (id !== localParticipant?.session_id) {
        if (visibleParticipantIds.some((visId) => visId === id)) {
          subscribedIds.push(id);
        } else {
          stagedIds.push(id);
        }
      }
    }

    return {
      subscribedIds,
      stagedIds,
    };
  }, [
    localParticipant?.session_id,
    maxCamSubscriptions,
    orderedParticipantIds,
    page,
    pageSize,
    visibleParticipantIds,
  ]);

  useCamSubscriptions(
    camSubscriptions?.subscribedIds,
    camSubscriptions?.pausedIds
  );

  /**
   * Set bandwidth layer based on amount of visible participants
   */
  useEffect(() => {
    if (!(callObject && callObject.meetingState() === MEETING_STATE_JOINED))
      return;
    const count = visibleParticipantIds.length;

    let layer;
    if (count < 5) {
      // highest quality layer
      layer = 2;
    } else if (count < 10) {
      // mid quality layer
      layer = 1;
    } else {
      // low quality layer
      layer = 0;
    }

    const receiveSettings = visibleParticipantIds.reduce(
      (settings, participantId) => {
        if (localParticipant.session_id === participantId) return settings;
        return { ...settings, [participantId]: { video: { layer } } };
      },
      {}
    );
    callObject.updateReceiveSettings(receiveSettings);
  }, [visibleParticipantIds, callObject, localParticipant.session_id]);

  // -- Active speaker

  /**
   * Handle position updates based on active speaker events
   */
  const sortedVisibleRemoteParticipantIds = useDeepCompareMemo(
    () =>
      visibleParticipantIds.slice(1).sort((a, b) => {
        const lastActiveA =
          participantMetaData[a]?.last_active_date ?? new Date('1970-01-01');
        const lastActiveB =
          participantMetaData[b]?.last_active_date ?? new Date('1970-01-01');
        if (lastActiveA > lastActiveB) return 1;
        if (lastActiveA < lastActiveB) return -1;
        return 0;
      }),
    [participantMetaData, visibleParticipantIds]
  );

  useDeepCompareEffect(() => {
    if (!activeSpeakerId) return;

    // active participant is already visible
    if (visibleParticipantIds.some((id) => id === activeSpeakerId)) return;
    // ignore repositioning when viewing page > 1
    if (page > 1) return;

    /**
     * We can now assume that
     * a) the user is looking at page 1
     * b) the most recent active participant is not visible on page 1
     * c) we'll have to promote the most recent participant's position to page 1
     *
     * To achieve that, we'll have to
     * - find the least recent active participant on page 1
     * - swap least & most recent active participant's position via setParticipantPosition
     */

    if (!sortedVisibleRemoteParticipantIds.length) return;

    swapParticipantPosition(
      sortedVisibleRemoteParticipantIds[0],
      activeSpeakerId
    );
  }, [
    activeSpeakerId,
    page,
    sortedVisibleRemoteParticipantIds,
    swapParticipantPosition,
    visibleParticipantIds,
  ]);

  const tiles = useDeepCompareMemo(
    () =>
      visibleParticipantIds.map((p) => (
        <Tile
          sessionId={p}
          mirrored
          key={p}
          style={{
            maxHeight: tileHeight,
            maxWidth: tileWidth,
          }}
        />
      )),
    [participantCount, tileWidth, tileHeight, visibleParticipantIds]
  );

  const handlePrevClick = () => setPage((p) => p - 1);
  const handleNextClick = () => setPage((p) => p + 1);

  return (
    <div ref={gridRef} className="grid">
      <Button
        className="page-button prev"
        disabled={!(pages > 1 && page > 1)}
        type="button"
        onClick={handlePrevClick}
      >
        <IconArrow />
      </Button>

      <div className="tiles">{tiles}</div>

      <Button
        className="page-button next"
        disabled={!(pages > 1 && page < pages)}
        type="button"
        onClick={handleNextClick}
      >
        <IconArrow />
      </Button>

      <style jsx>{`
        .grid {
          align-items: center;
          display: flex;
          height: 100%;
          justify-content: center;
          position: relative;
          width: 100%;
        }

        .grid .tiles {
          align-items: center;
          display: flex;
          flex-flow: row wrap;
          gap: 1px;
          max-height: 100%;
          justify-content: center;
          margin: auto;
          overflow: hidden;
          width: 100%;
        }

        .grid :global(.page-button) {
          border-radius: var(--radius-sm) 0 0 var(--radius-sm);
          height: 84px;
          padding: 0px var(--spacing-xxxs) 0px var(--spacing-xxs);
          background-color: var(--blue-default);
          color: white;
          border-right: 0px;
        }

        .grid :global(.page-button):disabled {
          color: var(--blue-dark);
          background-color: var(--blue-light);
          border-color: var(--blue-light);
        }

        .grid :global(.page-button.prev) {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};

PaginatedVideoGrid.propTypes = {
  maxTilesPerPage: PropTypes.number,
};

export default PaginatedVideoGrid;
