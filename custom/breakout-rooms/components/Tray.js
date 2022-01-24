import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconBreakout } from '@custom/shared/icons/breakout-md.svg';
import { BREAKOUT_ROOM_MODAL } from './BreakoutRoomModal';

export const Tray = () => {
  const { openModal } = useUIState();

  return (
    <>
      <TrayButton
        label="Breakout"
        onClick={() => openModal(BREAKOUT_ROOM_MODAL)}>
        <IconBreakout />
      </TrayButton>
    </>
  );
};

export default Tray;
