import React from 'react';
import VideoContainer from '@dailyjs/shared/components/VideoContainer/VideoContainer';

import { Container } from './Container';
import { Header } from './Header';
import { VideoGrid } from './VideoGrid';

export const Room = () => (
  <Container>
    <Header />
    <VideoContainer>
      <VideoGrid />
    </VideoContainer>
  </Container>
);

export default Room;
