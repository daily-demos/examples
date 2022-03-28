import React from 'react';

import { RECORDING_MODAL } from '@custom/recording/components/RecordingModal';
import { useRecording } from '@custom/recording/contexts/RecordingProvider';
import { TrayButton } from '@custom/shared/components/Tray';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { useCallConfig } from '@custom/shared/hooks/useCallConfig';
import { ReactComponent as IconRecord } from '@custom/shared/icons/record-md.svg';

export const Tray = () => {
  const { enableRecording } = useCallConfig();
  const { openModal } = useUIState();
  const { isRecording } = useRecording();
  const { isOwner } = useParticipants();

  if (!enableRecording) return null;
  if (!isOwner) return null;

  return (
    <TrayButton
      label={isRecording ? 'Stop' : 'Record'}
      orange={isRecording}
      onClick={() => openModal(RECORDING_MODAL)}
    >
      <IconRecord />
    </TrayButton>
  );
};

export default Tray;
