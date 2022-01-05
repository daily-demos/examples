import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import {
  CALL_STATE_REDIRECTING,
  CALL_STATE_JOINED,
} from '@custom/shared/contexts/useCallMachine';
import PropTypes from 'prop-types';
import { useDeepCompareEffect } from 'use-deep-compare';

export const RECORDING_ERROR = 'error';
export const RECORDING_SAVED = 'saved';
export const RECORDING_RECORDING = 'recording';
export const RECORDING_UPLOADING = 'uploading';
export const RECORDING_COUNTDOWN_1 = 'starting1';
export const RECORDING_COUNTDOWN_2 = 'starting2';
export const RECORDING_COUNTDOWN_3 = 'starting3';
export const RECORDING_IDLE = 'idle';

export const RECORDING_TYPE_CLOUD = 'cloud';
export const RECORDING_TYPE_CLOUD_BETA = 'cloud-beta';
export const RECORDING_TYPE_LOCAL = 'local';
export const RECORDING_TYPE_OUTPUT_BYTE_STREAM = 'output-byte-stream';
export const RECORDING_TYPE_RTP_TRACKS = 'rtp-tracks';

const RecordingContext = createContext({
  isRecordingLocally: false,
  recordingStartedDate: null,
  recordingState: RECORDING_IDLE,
  startRecording: null,
  stopRecording: null,
});

export const RecordingProvider = ({ children }) => {
  const {
    callObject,
    enableRecording,
    startCloudRecording,
    state,
  } = useCallState();
  const { participants } = useParticipants();
  const [recordingStartedDate, setRecordingStartedDate] = useState(null);
  const [recordingState, setRecordingState] = useState(RECORDING_IDLE);
  const [isRecordingLocally, setIsRecordingLocally] = useState(false);
  const [hasRecordingStarted, setHasRecordingStarted] = useState(false);
  const { setCustomCapsule } = useUIState();

  const handleOnUnload = useCallback(
    () => 'Unsaved recording in progress. Do you really want to leave?',
    []
  );

  useEffect(() => {
    if (
      !enableRecording ||
      !isRecordingLocally ||
      recordingState !== RECORDING_RECORDING ||
      state === CALL_STATE_REDIRECTING
    )
      return false;
    const prev = window.onbeforeunload;
    window.onbeforeunload = handleOnUnload;
    return () => {
      window.onbeforeunload = prev;
    };
  }, [
    enableRecording,
    handleOnUnload,
    recordingState,
    isRecordingLocally,
    state,
  ]);

  useEffect(() => {
    if (!callObject || !enableRecording) return false;

    const handleAppMessage = (ev) => {
      switch (ev?.data?.event) {
        case 'recording-starting':
          setRecordingState(RECORDING_COUNTDOWN_3);
          break;
        default:
          break;
      }
    };

    // The 'recording-data' event is emitted when an output-byte-stream recording has started
    // When the event emits, start writing data to the stream created in handleRecordingStarted()
    const handleRecordingData = async (ev) => {
      try {
        console.log('got data', ev);
        await window.writer.write(ev.data);
        if (ev.finished) {
          console.log('closing!');
          window.writer.close();
        }
      } catch (e) {
        console.error(e);
      }
    };

    callObject.on('app-message', handleAppMessage);
    callObject.on('recording-data', handleRecordingData);

    return () => {
      callObject.off('app-message', handleAppMessage);
      callObject.off('recording-data', handleRecordingData);
    };
  }, [callObject, enableRecording]);

  /**
   * Automatically start cloud recording, if startCloudRecording is set.
   */
  useEffect(() => {
    if (
      hasRecordingStarted ||
      !callObject ||
      !startCloudRecording ||
      enableRecording !== 'cloud' ||
      state !== CALL_STATE_JOINED
    )
      return false;

    // Small timeout, in case other participants are already in-call.
    const timeout = setTimeout(() => {
      const isSomebodyRecording = participants.some((p) => p.isRecording);
      if (!isSomebodyRecording) {
        callObject.startRecording();
        setIsRecordingLocally(true);
        setHasRecordingStarted(true);
      } else {
        setHasRecordingStarted(true);
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    callObject,
    enableRecording,
    hasRecordingStarted,
    participants,
    startCloudRecording,
    state,
  ]);

  /**
   * Handle participant updates to sync recording state.
   */
  useDeepCompareEffect(() => {
    if (isRecordingLocally || recordingState === RECORDING_SAVED) return;
    if (participants.some(({ isRecording }) => isRecording)) {
      setRecordingState(RECORDING_RECORDING);
    } else {
      setRecordingState(RECORDING_IDLE);
    }
  }, [isRecordingLocally, participants, recordingState]);

  /**
   * Handle recording started.
   */
  const handleRecordingStarted = useCallback(
    (event) => {
      console.log('RECORDING');
      console.log(event);

      if (recordingState === RECORDING_RECORDING) return;
      setRecordingState(RECORDING_RECORDING);
      if (event.local) {
        // Recording started locally, either through UI or programmatically
        setIsRecordingLocally(true);
        if (!recordingStartedDate) setRecordingStartedDate(new Date());
        // If an output-byte-stream recording has started, create a new data stream that can be piped to a third-party (in this case a file)
        if (event.type === 'output-byte-stream') {
          const { readable, writable } = new TransformStream({
            transform: (chunk, ctrl) => {
              chunk.arrayBuffer().then((b) => ctrl.enqueue(new Uint8Array(b)));
            },
          });
          window.writer = writable.getWriter();
          readable.pipeTo(window.streamSaver.createWriteStream('test-vid.mp4'));
        }
      }
    },
    [recordingState, recordingStartedDate]
  );

  useEffect(() => {
    if (!callObject || !enableRecording) return false;

    callObject.on('recording-started', handleRecordingStarted);
    return () => callObject.off('recording-started', handleRecordingStarted);
  }, [callObject, enableRecording, handleRecordingStarted]);

  /**
   * Handle recording stopped.
   */
  useEffect(() => {
    if (!callObject || !enableRecording) return false;

    const handleRecordingStopped = (event) => {
      console.log(event);
      if (isRecordingLocally) return;
      setRecordingState(RECORDING_IDLE);
      setRecordingStartedDate(null);
    };

    callObject.on('recording-stopped', handleRecordingStopped);
    return () => callObject.off('recording-stopped', handleRecordingStopped);
  }, [callObject, enableRecording, isRecordingLocally]);

  /**
   * Handle recording error.
   */
  const handleRecordingError = useCallback(() => {
    if (isRecordingLocally) setRecordingState(RECORDING_ERROR);
    setIsRecordingLocally(false);
  }, [isRecordingLocally]);

  useEffect(() => {
    if (!callObject || !enableRecording) return false;

    callObject.on('recording-error', handleRecordingError);
    return () => callObject.off('recording-error', handleRecordingError);
  }, [callObject, enableRecording, handleRecordingError]);

  const startRecording = useCallback(() => {
    if (!callObject || !isRecordingLocally) return;
    callObject.startRecording();
  }, [callObject, isRecordingLocally]);

  useEffect(() => {
    let timeout;
    switch (recordingState) {
      case RECORDING_COUNTDOWN_3:
        timeout = setTimeout(() => {
          setRecordingState(RECORDING_COUNTDOWN_2);
        }, 1000);
        break;
      case RECORDING_COUNTDOWN_2:
        timeout = setTimeout(() => {
          setRecordingState(RECORDING_COUNTDOWN_1);
        }, 1000);
        break;
      case RECORDING_COUNTDOWN_1:
        startRecording();
        break;
      case RECORDING_ERROR:
      case RECORDING_SAVED:
        timeout = setTimeout(() => {
          setRecordingState(RECORDING_IDLE);
          setIsRecordingLocally(false);
        }, 5000);
        break;
      default:
        break;
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [recordingState, startRecording]);

  // Show a custom capsule when recording in progress
  useEffect(() => {
    if (recordingState !== RECORDING_RECORDING) {
      setCustomCapsule(null);
    } else {
      setCustomCapsule({ variant: 'recording', label: 'Recording' });
    }
  }, [recordingState, setCustomCapsule]);

  const startRecordingWithCountdown = useCallback(() => {
    if (!callObject || !enableRecording) return;
    setIsRecordingLocally(true);
    setRecordingState(RECORDING_COUNTDOWN_3);
    callObject.sendAppMessage({
      event: 'recording-starting',
    });
  }, [callObject, enableRecording]);

  const stopRecording = useCallback(() => {
    if (!callObject || !enableRecording || !isRecordingLocally) return;
    if (recordingState === RECORDING_RECORDING) {
      switch (enableRecording) {
        case RECORDING_TYPE_LOCAL:
        case RECORDING_TYPE_OUTPUT_BYTE_STREAM:
          setRecordingState(RECORDING_SAVED);
          setIsRecordingLocally(false);
          break;
        case RECORDING_TYPE_CLOUD:
        case RECORDING_TYPE_CLOUD_BETA:
        case RECORDING_TYPE_RTP_TRACKS:
          setRecordingState(RECORDING_UPLOADING);
          setRecordingState(RECORDING_SAVED);
          break;
        default:
          break;
      }
    } else if (recordingState === RECORDING_IDLE) {
      return;
    } else {
      setIsRecordingLocally(false);
      setRecordingState(RECORDING_IDLE);
    }
    setRecordingStartedDate(null);
    callObject.stopRecording();
  }, [callObject, enableRecording, isRecordingLocally, recordingState]);

  return (
    <RecordingContext.Provider
      value={{
        isRecordingLocally,
        recordingStartedDate,
        recordingState,
        startRecordingWithCountdown,
        stopRecording,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
};

RecordingProvider.propTypes = {
  children: PropTypes.node,
};

export const useRecording = () => useContext(RecordingContext);
