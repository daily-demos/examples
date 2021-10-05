import React, { useEffect } from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconRecord } from '@custom/shared/icons/record-md.svg';

import {
  RECORDING_ERROR,
  RECORDING_RECORDING,
  RECORDING_SAVED,
  RECORDING_UPLOADING,
  useRecording,
} from '../contexts/RecordingProvider';
import { RECORDING_MODAL } from './RecordingModal';

export const Tray = () => {
  const { openModal } = useUIState();
  const { recordingState } = useRecording();

  useEffect(() => {
    console.log(`⏺️ Recording state: ${recordingState}`);

    if (recordingState === RECORDING_ERROR) {
      // show error modal here
    }
  }, [recordingState]);

  const isRecording = [
    RECORDING_RECORDING,
    RECORDING_UPLOADING,
    RECORDING_SAVED,
  ].includes(recordingState);

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
