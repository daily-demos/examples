import React from 'react';

import { TrayButton } from '@dailyjs/shared/components/Tray';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import { ReactComponent as IconChat } from '@dailyjs/shared/icons/chat-md.svg';
import { useChat } from '../../contexts/ChatProvider';
import { CHAT_ASIDE } from '../ChatAside/ChatAside';

export const Tray = () => {
  const { toggleAside } = useUIState();
  const { hasNewMessages } = useChat();

  return (
    <TrayButton
      label="Chat"
      bubble={hasNewMessages}
      onClick={() => {
        toggleAside(CHAT_ASIDE);
      }}
    >
      <IconChat />
    </TrayButton>
  );
};

export default Tray;
