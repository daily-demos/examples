import React from 'react';

import App from '@custom/basic-call/components/App';
import { TranscriptionProvider } from '@custom/shared/contexts/TranscriptionProvider';

// Extend our basic call app component with the Live Transcription context
export const AppWithTranscription = () => (
  <TranscriptionProvider>
    <App />
  </TranscriptionProvider>
);

export default AppWithTranscription;
