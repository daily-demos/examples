import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconChat } from '@custom/shared/icons/chat-md.svg';
import { useChat } from '../contexts/ChatProvider';
import { CHAT_ASIDE } from './ChatAside';

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
