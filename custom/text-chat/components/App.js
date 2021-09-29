import React from 'react';

import App from '@custom/basic-call/components/App';
import { ChatProvider } from '../contexts/ChatProvider';

// Extend our basic call app component with the chat context
export const AppWithChat = () => (
  <ChatProvider>
    <App />
  </ChatProvider>
);

export default AppWithChat;
