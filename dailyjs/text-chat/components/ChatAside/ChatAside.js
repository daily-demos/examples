import React from 'react';
import Aside from '@dailyjs/shared/components/Aside';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';

export const CHAT_ASIDE = 'chat';

export const ChatAside = () => {
  const { showAside, setShowAside } = useUIState();

  if (!showAside || showAside !== CHAT_ASIDE) {
    return null;
  }

  return (
    <Aside onClose={() => setShowAside(false)}>Hello I am teh chat aside</Aside>
  );
};

export default ChatAside;
