import React from 'react';

import { RoomContainer } from '@dailyjs/basic-call/components/Room/RoomContainer';
import { VideoContainer } from '@dailyjs/shared/components/VideoContainer';
import { Header } from './Header';

export const Room = () => (
  <RoomContainer>
    <Header />
    <VideoContainer>Hello</VideoContainer>
  </RoomContainer>
);

export default RoomContainer;
