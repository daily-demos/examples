import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconBreakout } from '@custom/shared/icons/breakout-md.svg';
import { BREAKOUT_ROOM_MODAL } from './BreakoutRoomModal';
import { useBreakoutRoom } from './BreakoutRoomProvider';

export const Tray = () => {
  const { openModal } = useUIState();
  const { isActive, endSession } = useBreakoutRoom();
  const { localParticipant } = useParticipants();

  const handleClick = () => {
    if (isActive) endSession();
    else openModal(BREAKOUT_ROOM_MODAL);
  }

  if (!localParticipant.isOwner) return;

  return (
    <>
      <TrayButton
        label={isActive ? 'End': 'Breakout'}
        onClick={handleClick}>
        <IconBreakout />
      </TrayButton>
    </>
  );
};

export default Tray;
