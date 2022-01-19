import React from 'react';

import { Container } from '@custom/basic-call/components/Call/Container';
import { Header } from '@custom/basic-call/components/Call/Header';
import VideoContainer from '@custom/shared/components/VideoContainer/VideoContainer';
import { VideoGrid } from './VideoGrid';

export function Room({ children }) {
  return (
    <Container>
      <Header />
      <VideoContainer>{children ? children : <VideoGrid />}</VideoContainer>
    </Container>
  );
}

export default Room;
