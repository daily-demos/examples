import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Tile from '@custom/shared/components/Tile';
import { DEFAULT_ASPECT_RATIO } from '@custom/shared/constants';
import { useResize } from '@custom/shared/hooks/useResize';
import PropTypes from 'prop-types';

const MAX_RATIO = DEFAULT_ASPECT_RATIO;
const MIN_RATIO = 4 / 3;

export const SpeakerTile = ({ participant, screenRef }) => {
  const [ratio, setRatio] = useState(MAX_RATIO);
  const [nativeAspectRatio, setNativeAspectRatio] = useState(null);
  const [screenHeight, setScreenHeight] = useState(1);

  const updateRatio = useCallback(() => {
    const rect = screenRef.current?.getBoundingClientRect();
    setRatio(rect.width / rect.height);
    setScreenHeight(rect.height);
  }, [screenRef]);

  useResize(() => updateRatio(), [updateRatio]);
  useEffect(() => updateRatio(), [updateRatio]);

  /**
   * Only use the video's native aspect ratio if it's in portrait mode
   * (e.g. mobile) to update how we crop videos. Otherwise, use landscape
   * defaults.
   */
  const handleNativeAspectRatio = (r) => {
    const isPortrait = r < 1;
    setNativeAspectRatio(isPortrait ? r : null);
  };

  const { height, finalRatio, videoFit } = useMemo(
    () =>
      // Avoid cropping mobile videos, which have the nativeAspectRatio set
      ({
        height: (nativeAspectRatio ?? ratio) >= MIN_RATIO ? '100%' : null,
        finalRatio:
          nativeAspectRatio || (ratio <= MIN_RATIO ? MIN_RATIO : MAX_RATIO),
        videoFit: ratio >= MAX_RATIO || nativeAspectRatio ? 'contain' : 'cover',
      }),
    [nativeAspectRatio, ratio]
  );

  const style = {
    height,
    maxWidth: screenHeight * finalRatio,
    overflow: 'hidden',
  };

  return (
    <Tile
      aspectRatio={finalRatio}
      participant={participant}
      style={style}
      videoFit={videoFit}
      showActiveSpeaker={false}
      onVideoResize={handleNativeAspectRatio}
    />
  );
};

SpeakerTile.propTypes = {
  participant: PropTypes.object,
  screenRef: PropTypes.object,
};

export default SpeakerTile;
