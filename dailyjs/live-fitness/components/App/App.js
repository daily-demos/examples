import React from 'react';

import App from '@dailyjs/basic-call/components/App';
import FlyingEmojiOverlay from '@dailyjs/flying-emojis/components/FlyingEmojis';
import { ChatProvider } from '@dailyjs/text-chat/contexts/ChatProvider';

export const LiveFitnessApp = () => (
  <>
    <ChatProvider>
      <FlyingEmojiOverlay />
      <App />
    </ChatProvider>
  </>
);

export default LiveFitnessApp;
