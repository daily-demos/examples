import { useMemo, useRef, useState } from 'react';

import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import useResize from '@custom/shared/hooks/useResize';
import defaultTheme from '@custom/shared/styles/defaultTheme';
import { ScreenTile } from './ScreenTile';

const MAX_SCREENS_AND_PINS = 3;

export const Screens = () => {
  const viewRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
  });
  const { screens } = useParticipants();

  useResize(() => {
    const { width, height } = viewRef.current?.getBoundingClientRect();
    setDimensions({
      width,
      height,
    });
  }, [viewRef]);

  const { aspectRatio, height, maxWidth } = useMemo(() => {
    /**
     * We're relying on calculating what there is room for
     * the total number of s+p tiles instead of using
     * videoTrack.getSettings because (currently) getSettings
     * is unreliable in Firefox.
     */
    const containerAR = dimensions.width / dimensions.height;
    const maxItems = Math.min(screens.length, MAX_SCREENS_AND_PINS);
    const cols = Math.min(maxItems, Math.ceil(containerAR));
    const rows = Math.ceil(screens.length / cols);
    const height = dimensions.height / rows;
    const maxWidth = dimensions.width / cols;
    return {
      height,
      maxWidth,
      aspectRatio: maxWidth / height,
    };
  }, [dimensions, screens.length]);

  return (
    <div ref={viewRef}>
      <>
        {screens.map((s) => (
          <div
            className="tileWrapper"
            key={s.screenId}
            style={{
              height,
              maxWidth,
            }}
          >
            <ScreenTile
              height={height}
              maxWidth={maxWidth}
              ratio={aspectRatio}
              sessionId={s.session_id}
            />
          </div>
        ))}
      </>
      <style jsx>{`
        div {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          height: 100%;
          justify-content: center;
          width: 100%;
        }
        div :global(.tileWrapper) {
          background: ${defaultTheme.background};
          align-items: center;
          display: flex;
          flex: none;
          justify-content: center;
          position: relative;
          width: 100%;
        }
        div :global(.tile .content) {
          margin: auto;
          max-height: 100%;
          max-width: 100%;
        }
      `}</style>
    </div>
  );
};
