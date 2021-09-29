import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconMusic } from '@custom/shared/icons/music-md.svg';
import { MUSIC_MODAL } from './MusicModal';

export const Tray = () => {
  const { openModal } = useUIState();

  return (
    <TrayButton label="Music" onClick={() => openModal(MUSIC_MODAL)}>
      <IconMusic />
    </TrayButton>
  );
};

export default Tray;
