import React from 'react';

import App from '@custom/basic-call/components/App';
import { Room } from '../Room';

// Extend our basic call app component with our custom Room componenet
export const AppWithSpeakerViewRoom = () => (
  <App
    customComponentForState={{
      room: <Room />,
    }}
  />
);

export default AppWithSpeakerViewRoom;
