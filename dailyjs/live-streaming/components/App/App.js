import React from 'react';
import Amplify, { API } from 'aws-amplify';
import awsconfig from '../../../../src/aws-exports';

Amplify.configure(awsconfig);

import App from '@dailyjs/basic-call/components/App';
import { LiveStreamingProvider } from '../../contexts/LiveStreamingProvider';

// Extend our basic call app component with the live streaming context
export const AppWithLiveStreaming = () => (
  <LiveStreamingProvider>
    <App />
  </LiveStreamingProvider>
);

export default AppWithLiveStreaming;
