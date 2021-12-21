import { useState, useCallback, useEffect } from 'react';
import { sortByKey } from '../lib/sortByKey';

export const DEVICE_STATE_LOADING = 'loading';
export const DEVICE_STATE_PENDING = 'pending';
export const DEVICE_STATE_ERROR = 'error';
export const DEVICE_STATE_GRANTED = 'granted';
export const DEVICE_STATE_NOT_FOUND = 'not-found';
export const DEVICE_STATE_NOT_SUPPORTED = 'not-supported';
export const DEVICE_STATE_BLOCKED = 'blocked';
export const DEVICE_STATE_IN_USE = 'in-use';
export const DEVICE_STATE_OFF = 'off';
export const DEVICE_STATE_PLAYABLE = 'playable';
export const DEVICE_STATE_SENDABLE = 'sendable';

export const useDevices = (callObject) => {
  const [deviceState, setDeviceState] = useState(DEVICE_STATE_LOADING);
  const [currentCam, setCurrentCam] = useState(null);
  const [currentMic, setCurrentMic] = useState(null);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);

  const [cams, setCams] = useState([]);
  const [mics, setMics] = useState([]);
  const [speakers, setSpeakers] = useState([]);

  const [camError, setCamError] = useState(null);
  const [micError, setMicError] = useState(null);

  const updateDeviceState = useCallback(async () => {
    if (
      typeof navigator?.mediaDevices?.getUserMedia === 'undefined' ||
      typeof navigator?.mediaDevices?.enumerateDevices === 'undefined'
    ) {
      setDeviceState(DEVICE_STATE_NOT_SUPPORTED);
      return;
    }

    try {
      const { devices } = await callObject.enumerateDevices();

      const { camera, mic, speaker } = await callObject.getInputDevices();

      setCurrentCam(camera ?? null);
      setCurrentMic(mic ?? null);
      setCurrentSpeaker(speaker ?? null);

      const [defaultCam, ...videoDevices] = devices.filter(
        (d) => d.kind === 'videoinput' && d.deviceId !== ''
      );
      setCams(
        [
          defaultCam,
          ...videoDevices.sort((a, b) => sortByKey(a, b, 'label', false)),
        ].filter(Boolean)
      );
      const [defaultMic, ...micDevices] = devices.filter(
        (d) => d.kind === 'audioinput' && d.deviceId !== ''
      );
      setMics(
        [
          defaultMic,
          ...micDevices.sort((a, b) => sortByKey(a, b, 'label', false)),
        ].filter(Boolean)
      );
      const [defaultSpeaker, ...speakerDevices] = devices.filter(
        (d) => d.kind === 'audiooutput' && d.deviceId !== ''
      );
      setSpeakers(
        [
          defaultSpeaker,
          ...speakerDevices.sort((a, b) => sortByKey(a, b, 'label', false)),
        ].filter(Boolean)
      );

      console.log(`Current cam: ${camera.label}`);
      console.log(`Current mic: ${mic.label}`);
      console.log(`Current speakers: ${speaker.label}`);
    } catch (e) {
      setDeviceState(DEVICE_STATE_NOT_SUPPORTED);
    }
  }, [callObject]);

  const updateDeviceErrors = useCallback(() => {
    if (!callObject) return;
    const { tracks } = callObject.participants().local;

    if (tracks.video?.blocked?.byPermissions) {
      setCamError(DEVICE_STATE_BLOCKED);
    } else if (tracks.video?.blocked?.byDeviceMissing) {
      setCamError(DEVICE_STATE_NOT_FOUND);
    } else if (tracks.video?.blocked?.byDeviceInUse) {
      setCamError(DEVICE_STATE_IN_USE);
    }

    if (
      [
        DEVICE_STATE_LOADING,
        DEVICE_STATE_OFF,
        DEVICE_STATE_PLAYABLE,
        DEVICE_STATE_SENDABLE,
      ].includes(tracks.video.state)
    ) {
      setCamError(null);
    }

    if (tracks.audio?.blocked?.byPermissions) {
      setMicError(DEVICE_STATE_BLOCKED);
    } else if (tracks.audio?.blocked?.byDeviceMissing) {
      setMicError(DEVICE_STATE_NOT_FOUND);
    } else if (tracks.audio?.blocked?.byDeviceInUse) {
      setMicError(DEVICE_STATE_IN_USE);
    }

    if (
      [
        DEVICE_STATE_LOADING,
        DEVICE_STATE_OFF,
        DEVICE_STATE_PLAYABLE,
        DEVICE_STATE_SENDABLE,
      ].includes(tracks.audio.state)
    ) {
      setMicError(null);
    }
  }, [callObject]);

  const handleParticipantUpdated = useCallback(
    ({ participant }) => {
      if (!callObject || deviceState === 'not-supported' || !participant.local) return;

      switch (participant?.tracks.video.state) {
        case DEVICE_STATE_BLOCKED:
          setDeviceState(DEVICE_STATE_ERROR);
          break;
        case DEVICE_STATE_OFF:
        case DEVICE_STATE_PLAYABLE:
          updateDeviceState();
          setDeviceState(DEVICE_STATE_GRANTED);
          break;
      }

      updateDeviceErrors();
    },
    [callObject, deviceState, updateDeviceErrors, updateDeviceState]
  );

  useEffect(() => {
    if (!callObject) return;

    /**
      If the user is slow to allow access, we'll update the device state
      so our app can show a prompt requesting access
    */
    let pendingAccessTimeout;

    const handleJoiningMeeting = () => {
      pendingAccessTimeout = setTimeout(() => {
        setDeviceState(DEVICE_STATE_PENDING);
      }, 2000);
    };

    const handleJoinedMeeting = () => {
      clearTimeout(pendingAccessTimeout);
      // Note: setOutputDevice() is not honored before join() so we must enumerate again
      updateDeviceState();
    };

    updateDeviceState();
    callObject.on('joining-meeting', handleJoiningMeeting);
    callObject.on('joined-meeting', handleJoinedMeeting);
    callObject.on('participant-updated', handleParticipantUpdated);
    return () => {
      clearTimeout(pendingAccessTimeout);
      callObject.off('joining-meeting', handleJoiningMeeting);
      callObject.off('joined-meeting', handleJoinedMeeting);
      callObject.off('participant-updated', handleParticipantUpdated);
    };
  }, [callObject, handleParticipantUpdated, updateDeviceState]);

  useEffect(() => {
    if (!callObject) return;

    console.log('💻 Device provider events bound');

    const handleCameraError = ({
      errorMsg: { errorMsg, audioOk, videoOk },
      error,
    }) => {
      switch (error?.type) {
        case 'cam-in-use':
          setDeviceState(DEVICE_STATE_ERROR);
          setCamError(DEVICE_STATE_IN_USE);
          break;
        case 'mic-in-use':
          setDeviceState(DEVICE_STATE_ERROR);
          setMicError(DEVICE_STATE_IN_USE);
          break;
        case 'cam-mic-in-use':
          setDeviceState(DEVICE_STATE_ERROR);
          setCamError(DEVICE_STATE_IN_USE);
          setMicError(DEVICE_STATE_IN_USE);
          break;
        default:
          switch (errorMsg) {
            case 'devices error':
              setDeviceState(DEVICE_STATE_ERROR);
              setCamError(videoOk ? null : DEVICE_STATE_NOT_FOUND);
              setMicError(audioOk ? null : DEVICE_STATE_NOT_FOUND);
              break;
            case 'not allowed':
              setDeviceState(DEVICE_STATE_ERROR);
              updateDeviceErrors();
              break;
            default:
              break;
          }
          break;
      }
    };

    const handleError = ({ errorMsg }) => {
      switch (errorMsg) {
        case 'not allowed':
          setDeviceState(DEVICE_STATE_ERROR);
          updateDeviceErrors();
          break;
        default:
          break;
      }
    };

    const handleStartedCamera = () => {
      updateDeviceErrors();
    };

    callObject.on('camera-error', handleCameraError);
    callObject.on('error', handleError);
    callObject.on('started-camera', handleStartedCamera);
    return () => {
      callObject.off('camera-error', handleCameraError);
      callObject.off('error', handleError);
      callObject.off('started-camera', handleStartedCamera);
    };
  }, [callObject, updateDeviceErrors]);

  return {
    camError,
    cams,
    currentCam,
    currentMic,
    currentSpeaker,
    deviceState,
    micError,
    mics,
    refreshDevices: updateDeviceState,
    setCurrentCam,
    setCurrentMic,
    setCurrentSpeaker,
    speakers,
  };
};

export default useDevices;
