import React from 'react';
import App from '@dailyjs/basic-call/components/App';
import Amplify from 'aws-amplify';
import awsmobile from '../../../../src/aws-exports';
import { LiveStreamingProvider } from '../../contexts/LiveStreamingProvider';

Amplify.configure(awsmobile);

// Extend our basic call app component with the live streaming context
export const AppWithLiveStreaming = () => (
  <LiveStreamingProvider>
    <App />
  </LiveStreamingProvider>
);

export default AppWithLiveStreaming;
