import React from 'react';
import VideoContainer from '@custom/shared/components/VideoContainer/VideoContainer';

import { Container } from './Container';
import { Header } from './Header';
import { VideoView } from './VideoView';

export function Room({ children }) {
  return (
    <Container>
      <Header />
      <VideoContainer>{children ? children : <VideoView />}</VideoContainer>
    </Container>
  );
}

export default Room;
