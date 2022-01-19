import React from 'react';

import App from '@custom/basic-call/components/App';
import Room from './Room';

export const AppWithBreakoutRooms = () => {
  return (
    <App
      customComponentForState={{
        room: <Room />,
      }}
    />
  );
}

export default AppWithBreakoutRooms;
