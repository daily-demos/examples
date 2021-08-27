import React from 'react';
import awsconfig from '../../../../src/aws-exports';
import Amplify from 'aws-amplify';
import App from '@dailyjs/basic-call/components/App';
import { LiveStreamingProvider } from '../../contexts/LiveStreamingProvider';

Amplify.configure(awsconfig);

// Extend our basic call app component with the live streaming context
export const AppWithLiveStreaming = () => (
  <LiveStreamingProvider>
    <App />
  </LiveStreamingProvider>
);

export default AppWithLiveStreaming;
