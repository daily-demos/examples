import React from 'react';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState, VIEW_MODE_SPEAKER } from '@custom/shared/contexts/UIStateProvider';
import { GridView } from '../GridView/GridView';
import { SpeakerView } from '../SpeakerView';

export const VideoView = () => {
  const { viewMode } = useUIState();
  const { participants } = useParticipants();

  if (!participants.length) return null;
  return viewMode === VIEW_MODE_SPEAKER ? <SpeakerView />: <GridView />;
};

export default VideoView;
