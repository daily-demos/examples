import React from 'react';

import { TrayButton } from '@dailyjs/shared/components/Tray';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import { ReactComponent as IconChat } from '@dailyjs/shared/icons/chat-md.svg';
import { useBreakout } from '../../contexts/BreakoutProvider';
import { BREAKOUT_ASIDE } from '../BreakoutAside/BreakoutAside';

export const Tray = () => {
  const { toggleAside } = useUIState();
  const { hasNewMessages } = useBreakout();
  const { localParticipant } = useParticipants();

  return (

    <>
    {/* {localParticipant?.isOwner &&  */}
      <TrayButton
      label="Breakout"
      bubble={hasNewMessages}
      onClick={() => {
        toggleAside(BREAKOUT_ASIDE);
      }}
      >
        <IconChat />
      </TrayButton>
      {/* } */}
    </>
  );
};

export default Tray;
