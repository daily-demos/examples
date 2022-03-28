import React, { useEffect } from 'react';
import { SpeakerView } from '@custom/active-speaker/components/SpeakerView';
import { PaginatedVideoGrid as GridView } from '@custom/pagination/components/PaginatedVideoGrid';
import VideoContainer from '@custom/shared/components/VideoContainer';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import {
  useUIState,
  VIEW_MODE_SPEAKER,
} from '@custom/shared/contexts/UIStateProvider';
import Container from './Container';
import Header from './Header';
import InviteOthers from './InviteOthers';

export const VideoView = () => {
  const { viewMode, setIsShowingScreenshare } = useUIState();
  const { participantCount, screens } = useParticipants();

  useEffect(() => {
    const hasScreens = screens.length > 0;
    setIsShowingScreenshare(hasScreens);
  }, [screens, setIsShowingScreenshare]);

  if (!participantCount) return null;
  if (participantCount === 1 && !screens.length > 0) return <InviteOthers />;

  return (
    <>
      {viewMode === VIEW_MODE_SPEAKER ? (
        <SpeakerView />
      ) : (
        <Container>
          <Header />
          <VideoContainer>
            <GridView />
          </VideoContainer>
        </Container>
      )}
    </>
  );
};

export default VideoView;
