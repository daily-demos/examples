import React from 'react';

import { TrayButton } from '@dailyjs/shared/components/Tray';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import { ReactComponent as IconTranscription } from '@dailyjs/shared/icons/chat-md.svg';
import { useTranscription } from '../../contexts/TranscriptionProvider';
import { TRANSCRIPTION_ASIDE } from '../TranscriptionAside/TranscriptionAside';

export const Tray = () => {
  const { toggleAside } = useUIState();
  const { hasNewMessages } = useTranscription();

  return (
    <TrayButton
      label="Transcript"
      bubble={hasNewMessages}
      onClick={() => {
        toggleAside(TRANSCRIPTION_ASIDE);
      }}
    >
      <IconTranscription />
    </TrayButton>
  );
};

export default Tray;
