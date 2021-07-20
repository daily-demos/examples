import React from 'react';

import { VideoGrid } from '../VideoGrid';
import { Header } from './Header';
import { RoomContainer } from './RoomContainer';

export const Room = () => (
  <RoomContainer>
    <Header />
    <main>
      <VideoGrid />
    </main>
  </RoomContainer>
);

export default Room;
