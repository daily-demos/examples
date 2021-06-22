import React from 'react';

import { TrayButton } from '@dailyjs/shared/components/Tray';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import { ReactComponent as IconChat } from '@dailyjs/shared/icons/chat-md.svg';
import { CHAT_ASIDE } from '../ChatAside/ChatAside';

export const Tray = () => {
  const { toggleAside } = useUIState();

  return (
    <>
      <TrayButton label="Chat" onClick={() => toggleAside(CHAT_ASIDE)}>
        <IconChat />
      </TrayButton>
    </>
  );
};

export default Tray;
