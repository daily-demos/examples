import React, { useEffect } from 'react';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState, VIEW_MODE_SPEAKER } from '@custom/shared/contexts/UIStateProvider';
import { GridView } from '../GridView/GridView';
import { SpeakerView } from '../SpeakerView';

export const VideoView = () => {
  const { viewMode, setIsShowingScreenshare } = useUIState();
  const { participants, screens } = useParticipants();

  useEffect(() => {
    const hasScreens = screens.length > 0;
    setIsShowingScreenshare(hasScreens);
  }, [screens, setIsShowingScreenshare]);

  if (!participants.length) return null;
  return viewMode === VIEW_MODE_SPEAKER ? <SpeakerView />: <GridView />;
};

export default VideoView;
