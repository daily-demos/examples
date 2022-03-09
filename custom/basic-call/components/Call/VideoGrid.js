import React, { useState, useMemo, useEffect, useRef } from 'react';
import Tile from '@custom/shared/components/Tile';
import { DEFAULT_ASPECT_RATIO } from '@custom/shared/constants';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useDeepCompareMemo } from 'use-deep-compare';

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
    const { participantCount, orderedParticipantIds, localParticipant } =
      useParticipants();
    const [dimensions, setDimensions] = useState({
      width: 1,
      height: 1,
    });

    // Keep a reference to the width and height of the page, so we can repack
    useEffect(() => {
      let frame;
      const handleResize = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const dims = containerRef.current?.getBoundingClientRect();
          setDimensions({
            width: Math.floor(dims.width),
            height: Math.floor(dims.height),
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

    const [tileWidth, tileHeight] = useMemo(() => {
      const width = Math.floor(dimensions.width);
      const height = Math.floor(dimensions.height);
      const tileCount = participantCount || 0;
      if (tileCount === 0) return [width, height];
      const dims = [];
      /**
       * We'll calculate the possible tile dimensions for 1 to n columns.
       */
      for (let columnCount = 1; columnCount <= tileCount; columnCount++) {
        // Pixels used for flex gap between tiles
        const columnGap = columnCount - 1;
        let maxWidthPerTile = Math.floor((width - columnGap) / columnCount);
        let maxHeightPerTile = Math.floor(
          maxWidthPerTile / DEFAULT_ASPECT_RATIO
        );
        const rowCount = Math.ceil(tileCount / columnCount);
        const rowGap = rowCount - 1;
        if (rowCount * maxHeightPerTile + rowGap > height) {
          maxHeightPerTile = Math.floor((height - rowGap) / rowCount);
          maxWidthPerTile = Math.floor(maxHeightPerTile * DEFAULT_ASPECT_RATIO);
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
    }, [dimensions.height, dimensions.width, participantCount]);

    const visibleParticipants = useMemo(
      () => [localParticipant.session_id, ...orderedParticipantIds],
      [localParticipant.session_id, orderedParticipantIds]
    );

    // Memoize our tile list to avoid unnecassary re-renders
    const tiles = useDeepCompareMemo(
      () =>
        visibleParticipants.map((p) => (
          <Tile
            sessionId={p}
            key={p}
            mirrored
            style={{ maxWidth: tileWidth, maxHeight: tileHeight }}
          />
        )),
      [tileWidth, tileHeight, visibleParticipants]
    );

    if (!visibleParticipants.length) {
      return null;
    }

    return (
      <div className="video-grid" ref={containerRef}>
        <div className="tiles">{tiles}</div>
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
