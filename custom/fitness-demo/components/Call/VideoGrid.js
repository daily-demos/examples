import React, { useState, useMemo, useEffect, useRef } from 'react';
import ParticipantBar from '@custom/shared/components/ParticipantBar';
import Tile from '@custom/shared/components/Tile';
import { DEFAULT_ASPECT_RATIO } from '@custom/shared/constants';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useDeepCompareMemo } from 'use-deep-compare';

const SIDEBAR_WIDTH = 186;

/**
 * Basic unpaginated video tile grid, scaled by aspect ratio
 *
 * Note: this component is designed to work with automated track subscriptions
 * and is only suitable for small call sizes as it will show all participants
 * and not paginate.
 *
 * Note: this grid does not show screenshares (just participant cams)
 *
 * Note: this grid does not sort participants
 */
export const VideoGrid = React.memo(
  () => {
    const containerRef = useRef();
    const { allParticipants, participants, screens, localParticipant } = useParticipants();
    const { showLocalVideo } = useCallState();
    const [dimensions, setDimensions] = useState({
      width: 1,
      height: 1,
    });

    // Keep a reference to the width and height of the page, so we can repack
    useEffect(() => {
      let frame;
      const handleResize = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() =>
          setDimensions({
            width: containerRef.current?.clientWidth,
            height: containerRef.current?.clientHeight,
          })
        );
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
    }, []);

    const hasScreenshares = useMemo(() => screens.length > 0, [screens]);

    // Basic brute-force packing algo
    const layout = useMemo(() => {
      const aspectRatio = DEFAULT_ASPECT_RATIO;
      const tileCount = hasScreenshares ? screens.length : participants.length || 0;
      const w = dimensions.width;
      const h = dimensions.height;

      // brute-force search layout where video occupy the largest area of the container
      let bestLayout = {
        area: 0,
        cols: 0,
        rows: 0,
        width: 0,
        height: 0,
      };

      for (let cols = 0; cols <= tileCount; cols += 1) {
        const rows = Math.ceil(tileCount / cols);
        const hScale = w / (cols * aspectRatio);
        const vScale = h / rows;
        let width;
        let height;
        if (hScale <= vScale) {
          width = Math.floor(w / cols);
          height = Math.floor(width / aspectRatio);
        } else {
          height = Math.floor(h / rows);
          width = Math.floor(height * aspectRatio);
        }
        const area = width * height;
        if (area > bestLayout.area) {
          bestLayout = {
            area,
            width,
            height,
            rows,
            cols,
          };
        }
      }

      return bestLayout;
    }, [hasScreenshares, screens.length, participants.length, dimensions.width, dimensions.height]);

    const otherParticipants = useMemo(
      () => participants.filter(({ isLocal }) => !isLocal),
      [participants]
    );

    const fixedItems = useMemo(() => {
      const items = [];
      if (showLocalVideo) {
        items.push(localParticipant);
      }
      if (hasScreenshares && otherParticipants.length > 0) {
        items.push(otherParticipants[0]);
      }
      return items;
    }, [hasScreenshares, localParticipant, otherParticipants, showLocalVideo]);

    const otherItems = useMemo(() => {
      if (otherParticipants.length > 1) {
        return otherParticipants.slice(hasScreenshares ? 1 : 0);
      }
      return [];
    }, [hasScreenshares, otherParticipants]);

    // Memoize our tile list to avoid unnecassary re-renders
    const tiles = useDeepCompareMemo(
      () =>
        participants.map((p) => (
          <Tile
            participant={p}
            key={p.id}
            mirrored
            style={{ maxWidth: layout.width, maxHeight: layout.height }}
          />
        )),
      [layout, participants]
    );

    const screenShareTiles = useDeepCompareMemo(
      () =>
        screens.map((p) => (
          <Tile
            participant={p}
            key={p.id}
            mirrored={false}
            style={{ maxWidth: layout.width, maxHeight: layout.height }}
          />
        )),
      [layout, screens]
    );

    if (!participants.length) return null;

    return (
      <div className="video-grid" ref={containerRef}>
        <div className="tiles">
          {screenShareTiles}
          {!hasScreenshares && tiles}
        </div>
        {hasScreenshares && (
          <ParticipantBar
            fixed={fixedItems}
            others={otherItems}
            width={SIDEBAR_WIDTH}
          />
        )}
        <style jsx>{`
          .video-grid {
            align-items: center;
            display: flex;
            height: 100%;
            justify-content: center;
            position: relative;
            width: 100%;
          }

          .video-grid .tiles {
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
  },
  () => true
);

export default VideoGrid;
