import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';

import { CALL_STATE_REDIRECTING } from '@custom/shared/contexts/useCallMachine';
import {
  isCloudRecordingType,
  useCallConfig,
} from '@custom/shared/hooks/useCallConfig';
import {
  useAppMessage,
  useDaily,
  useRecording as useDailyRecording,
} from '@daily-co/daily-react-hooks';

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
export const RECORDING_TYPE_RTP_TRACKS = 'rtp-tracks';

const RecordingContext = createContext({
  error: null,
  recordingState: RECORDING_IDLE,
  isRecording: false,
  startRecording: null,
  stopRecording: null,
});

export const RecordingProvider = ({ children }) => {
  const { state } = useCallState();
  const { setCustomCapsule } = useUIState();
  const { enableRecording } = useCallConfig();
  const daily = useDaily();
  const [recordingState, setRecordingState] = useState(RECORDING_IDLE);

  const {
    error,
    isRecording,
    startRecording: startDailyRecording,
    stopRecording: stopDailyRecording,
  } = useDailyRecording();

  /**
   * Prevent users from accidentally leaving the meeting without stopping
   * their running recording.
   */
  const handleOnUnload = useCallback(
    () => 'Unsaved recording in progress. Do you really want to leave?',
    []
  );

  useEffect(() => {
    if (
      !enableRecording ||
      isCloudRecordingType(enableRecording) ||
      !isRecording ||
      state === CALL_STATE_REDIRECTING
    )
      return;
    const prev = window.onbeforeunload;
    window.onbeforeunload = handleOnUnload;
    return () => {
      window.onbeforeunload = prev;
    };
  }, [enableRecording, handleOnUnload, isRecording, state]);

  /**
   * Actually start the recording via API, after countdown.
   */
  const startRecordingReal = useCallback(() => {
    if (isRecording) return;
    if (isCloudRecordingType(enableRecording)) {
      startDailyRecording();
    } else {
      startDailyRecording();
    }
  }, [enableRecording, isRecording, startDailyRecording]);

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
        startRecordingReal();
        break;
      case RECORDING_ERROR:
      case RECORDING_SAVED:
        timeout = setTimeout(() => {
          setRecordingState(RECORDING_IDLE);
        }, 5000);
        break;
      default:
        break;
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [recordingState, startRecordingReal]);

  // Show a custom capsule when recording in progress
  useEffect(() => {
    if (!isRecording) {
      setCustomCapsule(null);
    } else {
      setRecordingState(RECORDING_RECORDING);
      setCustomCapsule({ variant: 'recording', label: 'Recording' });
    }
  }, [isRecording, setCustomCapsule]);

  const sendAppMessage = useAppMessage({
    onAppMessage: useCallback(
      (ev) => {
        switch (ev?.data?.event) {
          /**
           * Initialize recording countdown for remote participants.
           */
          case 'recording-starting':
            setRecordingState(RECORDING_COUNTDOWN_3);
            break;
        }
      },
      [setRecordingState]
    ),
  });

  const startRecordingWithCountdown = useCallback(() => {
    if (!daily || !enableRecording || isRecording) return;
    setRecordingState(RECORDING_COUNTDOWN_3);
    sendAppMessage({ event: 'recording-starting' });
  }, [daily, enableRecording, isRecording, sendAppMessage]);

  /**
   * Triggered via UI.
   */
  const stopRecording = useCallback(() => {
    if (!enableRecording || !isRecording) return;
    setRecordingState(RECORDING_SAVED);
    stopDailyRecording();
  }, [enableRecording, isRecording, stopDailyRecording]);

  return (
    <RecordingContext.Provider
      value={{
        error,
        isRecording,
        recordingState,
        startRecordingWithCountdown,
        stopRecording,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecording = () => useContext(RecordingContext);
