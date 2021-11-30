import React, { useEffect } from 'react';
import Button from '@custom/shared/components/Button';
import { CardBody } from '@custom/shared/components/Card';
import Modal from '@custom/shared/components/Modal';
import Well from '@custom/shared/components/Well';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import {
  RECORDING_COUNTDOWN_1,
  RECORDING_COUNTDOWN_2,
  RECORDING_COUNTDOWN_3,
  RECORDING_IDLE,
  RECORDING_RECORDING,
  RECORDING_SAVED,
  RECORDING_TYPE_CLOUD,
  RECORDING_TYPE_CLOUD_BETA,
  RECORDING_TYPE_RTP_TRACKS,
  RECORDING_UPLOADING,
  useRecording,
} from '../contexts/RecordingProvider';

export const RECORDING_MODAL = 'recording';

export const RecordingModal = () => {
  const { currentModals, closeModal } = useUIState();
  const { enableRecording } = useCallState();
  const {
    recordingStartedDate,
    recordingState,
    startRecordingWithCountdown,
    stopRecording,
  } = useRecording();

  useEffect(() => {
    if (recordingState === RECORDING_RECORDING) {
      closeModal(RECORDING_MODAL);
    }
  }, [recordingState, closeModal]);

  const disabled =
    enableRecording &&
    [RECORDING_IDLE, RECORDING_RECORDING].includes(recordingState);

  function renderButtonLabel() {
    if (!enableRecording) {
      return 'Recording disabled';
    }

    switch (recordingState) {
      case RECORDING_COUNTDOWN_3:
        return '3...';
      case RECORDING_COUNTDOWN_2:
        return '2...';
      case RECORDING_COUNTDOWN_1:
        return '1...';
      case RECORDING_RECORDING:
        return 'Stop recording';
      case RECORDING_UPLOADING:
      case RECORDING_SAVED:
        return 'Stopping recording...';
      default:
        return 'Start recording';
    }
  }

  function handleRecordingClick() {
    if (recordingState === RECORDING_IDLE) {
      startRecordingWithCountdown();
    } else {
      stopRecording();
    }
  }

  return (
    <Modal
      title="Recording"
      isOpen={currentModals[RECORDING_MODAL]}
      onClose={() => closeModal(RECORDING_MODAL)}
      actions={[
        <Button key="close" fullWidth variant="outline">
          Close
        </Button>,
        <Button
          fullWidth
          disabled={!disabled}
          key="record"
          onClick={() => handleRecordingClick()}
        >
          {renderButtonLabel()}
        </Button>,
      ]}
    >
      <CardBody>
        {!enableRecording ? (
          <Well variant="error">
            Recording is not enabled for this room (or your browser does not
            support it.) Please enable recording when creating the room or via
            the Daily dashboard.
          </Well>
        ) : (
          <p>
            Recording type enabled: <strong>{enableRecording}</strong>
          </p>
        )}

        {recordingStartedDate && (
          <p>Recording started: {recordingStartedDate.toString()}</p>
        )}

        {[RECORDING_TYPE_CLOUD, RECORDING_TYPE_CLOUD_BETA].includes(
          enableRecording
        ) && (
          <>
            <hr />

            <p>
              Cloud recordings can be accessed via the Daily dashboard under the
              &quot;Recordings&quot; section.
            </p>
          </>
        )}
        {enableRecording === RECORDING_TYPE_RTP_TRACKS && (
          <>
            <hr />

            <p>
              rtp-tracks recordings can be accessed via the Daily API. See the{' '}
              <a
                href="https://docs.daily.co/guides/recording-calls-with-the-daily-api#retrieve-individual-tracks-from-rtp-tracks-recordings"
                noreferrer
                target="_blank"
                rel="noreferrer"
              >
                Daily recording guide
              </a>{' '}
              for details.
            </p>
          </>
        )}
      </CardBody>
    </Modal>
  );
};

export default RecordingModal;
