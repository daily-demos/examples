import { useMemo, useRef, useState } from 'react';

import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { useResize } from '@custom/shared/hooks/useResize';
import { useDeepCompareMemo } from 'use-deep-compare';
import { ScreenPinTile } from './ScreenPinTile';

const MAX_SCREENS_AND_PINS = 3;

export const ScreensAndPins = ({ items }) => {
  const { showNames } = useCallState();
  const { pinnedId, sidebarView } = useUIState();
  const viewRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
  });

  useResize(() => {
    const { width, height } = viewRef.current?.getBoundingClientRect();
    setDimensions({
      width,
      height,
    });
  }, [viewRef, sidebarView]);

  const visibleItems = useDeepCompareMemo(() => {
    const isPinnedScreenshare = ({ id, isScreenshare }) =>
      isScreenshare && id === pinnedId;
    if (items.some(isPinnedScreenshare)) {
      return items.filter(isPinnedScreenshare);
    }
    return items;
  }, [items, pinnedId]);

  const { height, maxWidth, aspectRatio } = useMemo(() => {
    /**
     * We're relying on calculating what there is room for
     * for the total number of s+p tiles instead of using
     * videoTrack.getSettings because (currently) getSettings
     * is unreliable in Firefox.
     */
    const containerAR = dimensions.width / dimensions.height;
    const maxItems = Math.min(visibleItems.length, MAX_SCREENS_AND_PINS);
    const cols = Math.min(maxItems, Math.ceil(containerAR));
    const rows = Math.ceil(visibleItems.length / cols);
    const height = dimensions.height / rows;
    const maxWidth = dimensions.width / cols;
    return {
      height,
      maxWidth,
      aspectRatio: maxWidth / height,
    };
  }, [dimensions, visibleItems?.length]);

  return (
    <div ref={viewRef}>
      {visibleItems.map((item) => (
        <div
          className="tileWrapper"
          key={item.id}
          style={{
            height,
            maxWidth,
          }}
        >
          <ScreenPinTile
            height={height}
            hideName={!showNames}
            item={item}
            maxWidth={maxWidth}
            ratio={aspectRatio}
          />
        </div>
      ))}
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
          background: var(--background);
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

export default ScreensAndPins;