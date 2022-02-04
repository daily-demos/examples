import React from 'react';

import { Container } from '@custom/basic-call/components/Call/Container';
import VideoContainer from '@custom/shared/components/VideoContainer/VideoContainer';
import { Header } from './Header';
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
