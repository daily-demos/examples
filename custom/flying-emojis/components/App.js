import React from 'react';
import App from '@custom/basic-call/components/App';
import FlyingEmojiOverlay from './FlyingEmojisOverlay';

export const AppWithEmojis = () => (
  <>
    <FlyingEmojiOverlay />
    <App />
  </>
);

export default AppWithEmojis;
