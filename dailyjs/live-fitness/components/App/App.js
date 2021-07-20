import React from 'react';

import App from '@dailyjs/basic-call/components/App';
import FlyingEmojiOverlay from '@dailyjs/flying-emojis/components/FlyingEmojis';
import { ChatProvider } from '@dailyjs/text-chat/contexts/ChatProvider';
import Room from '../Room';

/**
 * We'll pass through our own custom Room for this example
 * as the layout logic changes considerably for the basic demo
 */
export const LiveFitnessApp = () => (
  <>
    <ChatProvider>
      <FlyingEmojiOverlay />
      <App
        customComponentForState={{
          room: () => <Room />,
        }}
      />
    </ChatProvider>
  </>
);

export default LiveFitnessApp;
