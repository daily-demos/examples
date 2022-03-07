import React from 'react';
import ChatTray from './Chat';
import RecordTray from './Record';
import ScreenShareTray from './ScreenShare';
import StreamTray from './Stream';

export const Tray = () => {
  return (
    <>
      <ChatTray />
      <ScreenShareTray />
      <RecordTray />
      <StreamTray />
    </>
  );
};

export default Tray;
