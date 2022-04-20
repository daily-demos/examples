import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useTranscription } from '@custom/shared/contexts/TranscriptionProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconTranscription } from '@custom/shared/icons/chat-md.svg';
import { TRANSCRIPTION_ASIDE } from './TranscriptionAside';

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
