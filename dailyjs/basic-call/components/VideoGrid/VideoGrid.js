import React, { useState, useMemo, useEffect, useRef } from 'react';
import Tile from '@dailyjs/shared/components/Tile';
import { DEFAULT_ASPECT_RATIO } from '@dailyjs/shared/constants';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import { useTracks } from '@dailyjs/shared/contexts/TracksProvider';
import { useDeepCompareMemo } from 'use-deep-compare';

export const VideoGrid = React.memo(
  () => {
    const containerRef = useRef();
    const { allParticipants } = useParticipants();
    const { resumeVideoTrack } = useTracks();
    const [dimensions, setDimensions] = useState({
      width: 1,
      height: 1,
    });

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

    const layout = useMemo(() => {
      const aspectRatio = DEFAULT_ASPECT_RATIO;
      const tileCount = allParticipants.length || 0;
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
    }, [dimensions, allParticipants]);

    const tiles = useDeepCompareMemo(
      () =>
        allParticipants.map((p) => (
          <Tile
            participant={p}
            key={p.id}
            mirrored
            style={{ maxWidth: layout.width, maxHeight: layout.height }}
          />
        )),
      [layout, allParticipants]
    );

    /**
     * Set bandwidth layer based on amount of visible participants
     */
    useEffect(() => {
      if (
        typeof rtcpeers === 'undefined' ||
        // eslint-disable-next-line no-undef
        rtcpeers?.getCurrentType() !== 'sfu'
      )
        return;

      // eslint-disable-next-line no-undef
      const sfu = rtcpeers.soup;
      const count = allParticipants.length;

      allParticipants.forEach(({ id }) => {
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
    }, [allParticipants]);

    useEffect(() => {
      allParticipants.forEach(
        (p) => p.id !== 'local' && resumeVideoTrack(p.id)
      );
    }, [allParticipants, resumeVideoTrack]);

    if (!allParticipants.length) {
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
