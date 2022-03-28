import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconRecord } from '@custom/shared/icons/record-md.svg';

import { useRecording } from '../contexts/RecordingProvider';
import { RECORDING_MODAL } from './RecordingModal';

export const Tray = () => {
  const { openModal } = useUIState();
  const { isRecording } = useRecording();

  return (
    <TrayButton
      label={isRecording ? 'Recording' : 'Record'}
      orange={isRecording}
      onClick={() => openModal(RECORDING_MODAL)}
    >
      <IconRecord />
    </TrayButton>
  );
};

export default Tray;
