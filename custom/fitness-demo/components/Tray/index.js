import React from 'react';
import ChatTray from './Chat';
import ScreenShareTray from './ScreenShare';

export const Tray = () => {
  return (
    <>
      <ChatTray />
      <ScreenShareTray />
    </>
  );
};

export default Tray;
