import React from 'react';

import App from '@custom/basic-call/components/App';
import { BreakoutRoomProvider } from './BreakoutRoomProvider';
import Room from './Room';

export const AppWithBreakoutRooms = () => (
  <BreakoutRoomProvider>
    <App
      customComponentForState={{
        room: <Room />
      }}
    />
  </BreakoutRoomProvider>
)

export default AppWithBreakoutRooms;
