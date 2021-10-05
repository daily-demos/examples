import React from 'react';

import App from '@custom/basic-call/components/App';
import { RecordingProvider } from '../contexts/RecordingProvider';

// Extend our basic call app component with the recording context
export const AppWithRecording = () => (
  <RecordingProvider>
    <App />
  </RecordingProvider>
);

export default AppWithRecording;
