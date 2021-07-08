/* global rtcpeers */

import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from 'react';

import Tile from '@dailyjs/shared/components/Tile';
import { DEFAULT_ASPECT_RATIO } from '@dailyjs/shared/constants';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import { useTracks } from '@dailyjs/shared/contexts/TracksProvider';
import { useActiveSpeaker } from '@dailyjs/shared/hooks/useActiveSpeaker';
import sortByKey from '@dailyjs/shared/lib/sortByKey';

import { useDeepCompareMemo } from 'use-deep-compare';

const MIN_TILE_WIDTH = 280;
const MAX_TILES_PER_PAGE = 12;

export const PaginatedVideoGrid = () => {
  const {
    activeParticipant,
    participantCount,
    participants,
    swapParticipantPosition,
  } = useParticipants();
  const activeSpeakerId = useActiveSpeaker();

  const { updateCamSubscriptions } = useTracks();

  const displayableParticipantCount = useMemo(
    () => participantCount,
    [participantCount]
  );

  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
  });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [maxTilesPerPage] = useState(MAX_TILES_PER_PAGE);

  const gridRef = useRef(null);

  // Update width and height of grid when window is resized
  useEffect(() => {
    let frame;
    const handleResize = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = gridRef.current?.clientWidth;
        const height = gridRef.current?.clientHeight;
        setDimensions({
          width,
          height,
        });
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

  const [maxColumns, maxRows] = useMemo(() => {
    const { width, height } = dimensions;

    const columns = Math.max(1, Math.floor(width / MIN_TILE_WIDTH));
    const widthPerTile = width / columns;
    const rows = Math.max(1, Math.floor(height / (widthPerTile * (9 / 16))));

    return [columns, rows];
  }, [dimensions]);

  const pageSize = useMemo(
    () => Math.min(maxColumns * maxRows, maxTilesPerPage),
    [maxColumns, maxRows, maxTilesPerPage]
  );

  useEffect(() => {
    setPages(Math.ceil(displayableParticipantCount / pageSize));
  }, [pageSize, displayableParticipantCount]);

  useEffect(() => {
    if (page <= pages) return;
    setPage(pages);
  }, [page, pages]);

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

  const visibleParticipants = useMemo(
    () =>
      participants.length - page * pageSize > 0
        ? participants.slice((page - 1) * pageSize, page * pageSize)
        : participants.slice(-pageSize),
    [page, pageSize, participants]
  );

  /**
   * Play / pause tracks based on pagination
   */
  const camSubscriptions = useMemo(() => {
    const maxSubs = 3 * pageSize;

    // Determine participant ids to subscribe to, based on page.
    let subscribedIds = [];
    switch (page) {
      // First page
      case 1:
        subscribedIds = participants
          .slice(0, Math.min(maxSubs, 2 * pageSize))
          .map((p) => p.id);
        break;
      // Last page
      case Math.ceil(participants.length / pageSize):
        subscribedIds = participants
          .slice(-Math.min(maxSubs, 2 * pageSize))
          .map((p) => p.id);
        break;
      // Any other page
      default:
        {
          const buffer = (maxSubs - pageSize) / 2;
          const min = (page - 1) * pageSize - buffer;
          const max = page * pageSize + buffer;
          subscribedIds = participants.slice(min, max).map((p) => p.id);
        }
        break;
    }

    // Determine subscribed, but invisible (= paused) video tracks
    const invisibleSubscribedIds = subscribedIds.filter(
      (id) => id !== 'local' && !visibleParticipants.some((vp) => vp.id === id)
    );
    return {
      subscribedIds: subscribedIds.filter((id) => id !== 'local'),
      pausedIds: invisibleSubscribedIds,
    };
  }, [page, pageSize, participants, visibleParticipants]);

  useEffect(() => {
    updateCamSubscriptions(
      camSubscriptions?.subscribedIds,
      camSubscriptions?.pausedIds
    );
  }, [
    camSubscriptions?.subscribedIds,
    camSubscriptions?.pausedIds,
    updateCamSubscriptions,
  ]);

  /**
   * Set bandwidth layer based on amount of visible participants
   */
  useEffect(() => {
    if (typeof rtcpeers === 'undefined' || rtcpeers?.getCurrentType() !== 'sfu')
      return;

    const sfu = rtcpeers.soup;
    const count = visibleParticipants.length;

    visibleParticipants.forEach(({ id }) => {
      if (count < 5) {
        // High quality video for calls with < 5 people per page
        sfu.setPreferredLayerForTrack(id, 'cam-video', 2);
      } else if (count < 10) {
        // Medium quality video for calls with < 10 people per page
        sfu.setPreferredLayerForTrack(id, 'cam-video', 1);
      } else {
        // Low quality video for calls with 10 or more people per page
        sfu.setPreferredLayerForTrack(id, 'cam-video', 0);
      }
    });
  }, [visibleParticipants]);

  /**
   * Handle position updates based on active speaker events
   */
  const handleActiveSpeakerChange = useCallback(
    (peerId) => {
      if (!peerId) return;
      // active participant is already visible
      if (visibleParticipants.some(({ id }) => id === peerId)) return;
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
      const sortedVisibleRemoteParticipants = visibleParticipants
        .filter(({ isLocal }) => !isLocal)
        .sort((a, b) => sortByKey(a, b, 'lastActiveDate'));

      if (!sortedVisibleRemoteParticipants.length) return;

      swapParticipantPosition(sortedVisibleRemoteParticipants[0].id, peerId);
    },
    [page, swapParticipantPosition, visibleParticipants]
  );

  useEffect(() => {
    if (page > 1 || !activeSpeakerId) return;
    handleActiveSpeakerChange(activeSpeakerId);
  }, [activeSpeakerId, handleActiveSpeakerChange, page]);

  const tiles = useDeepCompareMemo(
    () =>
      visibleParticipants.map((p) => (
        <Tile
          participant={p}
          mirrored
          key={p.id}
          style={{
            maxHeight: tileHeight,
            maxWidth: tileWidth,
          }}
        />
      )),
    [
      activeParticipant,
      participantCount,
      tileWidth,
      tileHeight,
      visibleParticipants,
    ]
  );

  const handlePrevClick = () => setPage((p) => p - 1);
  const handleNextClick = () => setPage((p) => p + 1);

  return (
    <div ref={gridRef} className="grid">
      {pages > 1 && page > 1 && (
        <button type="button" onClick={handlePrevClick}>
          &laquo;
        </button>
      )}
      <div className="tiles">{tiles}</div>
      {pages > 1 && page < pages && (
        <button type="button" onClick={handleNextClick}>
          &raquo;
        </button>
      )}
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
          max-height: 100%;
          justify-content: center;
          margin: auto;
          overflow: hidden;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default PaginatedVideoGrid;
