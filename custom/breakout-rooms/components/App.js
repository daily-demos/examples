import React from 'react';

import App from '@custom/basic-call/components/App';
import { BreakoutRoomProvider } from './BreakoutRoomProvider';
import Room from './Room';

export const AppWithBreakoutRooms = () => {
  return (
    <App
      customComponentForState={{
        room: (
          <BreakoutRoomProvider>
            <Room />
          </BreakoutRoomProvider>
        ),
      }}
    />
  );
}

export default AppWithBreakoutRooms;
