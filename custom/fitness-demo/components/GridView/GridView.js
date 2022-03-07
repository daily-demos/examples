import React, {
  useRef,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from 'react';
import Button from '@custom/shared/components/Button';
import Tile from '@custom/shared/components/Tile';
import VideoContainer from '@custom/shared/components/VideoContainer';
import {
  DEFAULT_ASPECT_RATIO,
  MEETING_STATE_JOINED,
} from '@custom/shared/constants';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { isLocalId } from '@custom/shared/contexts/participantsState';
import { useActiveSpeaker } from '@custom/shared/hooks/useActiveSpeaker';
import { useCamSubscriptions } from '@custom/shared/hooks/useCamSubscriptions';
import { ReactComponent as IconArrow } from '@custom/shared/icons/raquo-md.svg';
import sortByKey from '@custom/shared/lib/sortByKey';
import PropTypes from 'prop-types';
import { useDeepCompareMemo } from 'use-deep-compare';
import Container from '../Call/Container';
import Header from '../Call/Header';

// --- Constants

const MIN_TILE_WIDTH = 280;
const MAX_TILES_PER_PAGE = 12;

export const GridView = ({
 maxTilesPerPage = MAX_TILES_PER_PAGE,
}) => {
  const { callObject } = useCallState();
  const {
    activeParticipant,
    participantCount,
    participants,
    swapParticipantPosition,
  } = useParticipants();
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
  const visibleParticipants = useMemo(
    () =>
      participants.length - page * pageSize > 0
        ? participants.slice((page - 1) * pageSize, page * pageSize)
        : participants.slice(-pageSize),
    [page, pageSize, participants]
  );

  /**
   * Play / pause tracks based on pagination
   * Note: we pause adjacent page tracks and unsubscribe from everything else
   */
  const camSubscriptions = useMemo(() => {
    const maxSubs = 3 * pageSize;

    // Determine participant ids to subscribe to or stage, based on page
    let renderedOrBufferedIds = [];
    switch (page) {
      // First page
      case 1:
        renderedOrBufferedIds = participants
          .slice(0, Math.min(maxSubs, 2 * pageSize))
          .map((p) => p.id);
        break;
      // Last page
      case Math.ceil(participants.length / pageSize):
        renderedOrBufferedIds = participants
          .slice(-Math.min(maxSubs, 2 * pageSize))
          .map((p) => p.id);
        break;
      // Any other page
      default:
      {
        const buffer = (maxSubs - pageSize) / 2;
        const min = (page - 1) * pageSize - buffer;
        const max = page * pageSize + buffer;
        renderedOrBufferedIds = participants.slice(min, max).map((p) => p.id);
      }
        break;
    }

    const subscribedIds = [];
    const stagedIds = [];

    // Decide whether to subscribe to or stage participants'
    // track based on visibility
    renderedOrBufferedIds.forEach((id) => {
      if (id !== isLocalId()) {
        if (visibleParticipants.some((vp) => vp.id === id)) {
          subscribedIds.push(id);
        } else {
          stagedIds.push(id);
        }
      }
    });

    return {
      subscribedIds,
      stagedIds,
    };
  }, [page, pageSize, participants, visibleParticipants]);

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
    const count = visibleParticipants.length;

    let layer;
    if (count < 5) {
      // highest quality layer
      layer = 2;
    } else if (count < 10) {
      // mid quality layer
      layer = 1;
    } else {
      // low qualtiy layer
      layer = 0;
    }

    const receiveSettings = visibleParticipants.reduce(
      (settings, participant) => {
        if (isLocalId(participant.id)) return settings;
        return { ...settings, [participant.id]: { video: { layer } } };
      },
      {}
    );
    callObject.updateReceiveSettings(receiveSettings);
  }, [visibleParticipants, callObject]);

  // -- Active speaker

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
    <Container>
      <Header />
      <VideoContainer>
        <div ref={gridRef} className="grid">
          {(pages > 1 && page > 1) && (
            <Button
              className="page-button prev"
              type="button"
              onClick={handlePrevClick}
            >
              <IconArrow />
            </Button>
          )}
          <div className="tiles">{tiles}</div>
          {(pages > 1 && page < pages) && (
            <Button
              className="page-button next"
              type="button"
              onClick={handleNextClick}
            >
              <IconArrow />
            </Button>
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
      </VideoContainer>
    </Container>
  );
};

GridView.propTypes = {
  maxTilesPerPage: PropTypes.number,
};

export default GridView;
