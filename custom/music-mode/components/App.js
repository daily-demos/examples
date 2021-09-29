import React from 'react';
import App from '@custom/basic-call/components/App';
import { MusicProvider } from '../contexts/MusicProvider';

export const AppWithMusicMode = () => (
  <MusicProvider>
    <App />
  </MusicProvider>
);

export default AppWithMusicMode;
