import React from 'react';
import { RoomContainer } from '@dailyjs/basic-call/components/Room';
import VideoContainer from '@dailyjs/shared/components/VideoContainer/VideoContainer';
import { SpeakerView } from '../SpeakerView';

export const Room = () => (
  <RoomContainer>
    <VideoContainer>
      <SpeakerView />
    </VideoContainer>
  </RoomContainer>
);

export default Room;
