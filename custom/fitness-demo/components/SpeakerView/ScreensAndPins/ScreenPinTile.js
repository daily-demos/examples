import { useState } from 'react';
import Tile from '@custom/shared/components/Tile';

export const ScreenPinTile = ({
  height,
  hideName = false,
  item,
  maxWidth,
  ratio: initialRatio,
}) => {
  const [ratio, setRatio] = useState(initialRatio);
  const handleResize = (aspectRatio) => setRatio(aspectRatio);

  if (item.isScreenshare) {
    return (
      <Tile
        aspectRatio={initialRatio}
        hideName={hideName}
        participant={item}
        mirrored={false}
        style={{
          height,
          maxWidth,
        }}
      />
    );
  }

  return (
    <Tile
      aspectRatio={ratio}
      participant={item}
      onVideoResize={handleResize}
      style={{
        maxHeight: height,
        maxWidth: height * ratio,
      }}
    />
  );
};

export default ScreenPinTile;