import React from 'react';
import App from '@dailyjs/basic-call/components/App';
import FlyingEmojiOverlay from '../FlyingEmojis/FlyingEmojisOverlay';

export const AppWithEmojis = () => (
  <>
    <FlyingEmojiOverlay />
    <App />
  </>
);

export default AppWithEmojis;
