import React from 'react';
import App from '@dailyjs/basic-call/components/App';
import Amplify from 'aws-amplify';
import awsconfig from '../../aws-exports';
import { LiveStreamingProvider } from '../../contexts/LiveStreamingProvider';

Amplify.configure(awsconfig);

// Extend our basic call app component with the live streaming context
export const AppWithLiveStreaming = () => (
  <LiveStreamingProvider>
    <App />
  </LiveStreamingProvider>
);

export default AppWithLiveStreaming;
