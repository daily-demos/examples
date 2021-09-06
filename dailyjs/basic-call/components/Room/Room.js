import React from 'react';
import VideoContainer from '@dailyjs/shared/components/VideoContainer/VideoContainer';

import { VideoGrid } from '../VideoGrid';
import { Header } from './Header';
import { RoomContainer } from './RoomContainer';

export const Room = () => (
  <RoomContainer>
    <Header />
    <VideoContainer>
      <VideoGrid />
    </VideoContainer>
  </RoomContainer>
);

export default Room;
