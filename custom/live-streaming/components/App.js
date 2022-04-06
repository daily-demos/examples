import React from 'react';

import App from '@custom/basic-call/components/App';
import { LiveStreamingProvider } from '@custom/shared/contexts/LiveStreamingProvider';

// Extend our basic call app component with the live streaming context
export const AppWithLiveStreaming = () => (
  <LiveStreamingProvider>
    <App />
  </LiveStreamingProvider>
);

export default AppWithLiveStreaming;
