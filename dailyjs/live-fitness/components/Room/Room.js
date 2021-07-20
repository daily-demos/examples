import React from 'react';

import { RoomContainer } from '@dailyjs/basic-call/components/Room/RoomContainer';
import { Header } from './Header';

export const Room = () => (
  <RoomContainer>
    <Header />
    <main>Hello</main>
  </RoomContainer>
);

export default RoomContainer;
