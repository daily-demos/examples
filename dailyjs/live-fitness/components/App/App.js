import React from 'react';

import App from '@dailyjs/basic-call/components/App';
import FlyingEmojiOverlay from '@dailyjs/flying-emojis/components/FlyingEmojis';
import { LiveStreamingProvider } from '@dailyjs/live-streaming/contexts/LiveStreamingProvider';
import { RecordingProvider } from '@dailyjs/recording/contexts/RecordingProvider';
import { ChatProvider } from '@dailyjs/text-chat/contexts/ChatProvider';
import Room from '../Room';

/**
 * We'll pass through our own custom Room for this example
 * as the layout logic changes considerably for the basic demo
 */
export const LiveFitnessApp = () => (
  <ChatProvider>
    <LiveStreamingProvider>
      <RecordingProvider>
        <FlyingEmojiOverlay />
        <App
          customComponentForState={{
            room: () => <Room />,
          }}
        />
      </RecordingProvider>
    </LiveStreamingProvider>
  </ChatProvider>
);

export default LiveFitnessApp;
