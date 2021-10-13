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
  const [currentDevices, setCurrentDevices] = useState(null);

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

      setCurrentDevices({
        camera,
        mic,
        speaker,
      });

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
      if (!callObject || !participant.local) return;

      setDeviceState((prevState) => {
        if (prevState === DEVICE_STATE_NOT_SUPPORTED) return prevState;
        switch (participant?.tracks.video.state) {
          case DEVICE_STATE_BLOCKED:
            updateDeviceErrors();
            return DEVICE_STATE_ERROR;
          case DEVICE_STATE_OFF:
          case DEVICE_STATE_PLAYABLE:
            if (prevState === DEVICE_STATE_GRANTED) {
              return prevState;
            }
            updateDeviceState();
            return DEVICE_STATE_GRANTED;
          default:
            return prevState;
        }
      });
    },
    [callObject, updateDeviceState, updateDeviceErrors]
  );

  useEffect(() => {
    if (!callObject) return false;

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

  const setCamDevice = useCallback(
    async (newCam, useLocalStorage = true) => {
      if (!callObject || newCam.deviceId === currentDevices?.cam?.deviceId) {
        return;
      }

      console.log(`🔛 Changing camera device to: ${newCam.label}`);

      if (useLocalStorage) {
        localStorage.setItem('defaultCamId', newCam.deviceId);
      }

      await callObject.setInputDevicesAsync({
        videoDeviceId: newCam.deviceId,
      });

      setCurrentDevices((prev) => ({ ...prev, camera: newCam }));
    },
    [callObject, currentDevices]
  );

  const setMicDevice = useCallback(
    async (newMic, useLocalStorage = true) => {
      if (!callObject || newMic.deviceId === currentDevices?.mic?.deviceId) {
        return;
      }

      console.log(`🔛 Changing mic device to: ${newMic.label}`);

      if (useLocalStorage) {
        localStorage.setItem('defaultMicId', newMic.deviceId);
      }

      await callObject.setInputDevicesAsync({
        audioDeviceId: newMic.deviceId,
      });

      setCurrentDevices((prev) => ({ ...prev, mic: newMic }));
    },
    [callObject, currentDevices]
  );

  const setSpeakersDevice = useCallback(
    async (newSpeakers, useLocalStorage = true) => {
      if (
        !callObject ||
        newSpeakers.deviceId === currentDevices?.speaker?.deviceId
      ) {
        return;
      }

      console.log(`Changing speakers device to: ${newSpeakers.label}`);

      if (useLocalStorage) {
        localStorage.setItem('defaultSpeakersId', newSpeakers.deviceId);
      }

      callObject.setOutputDevice({
        outputDeviceId: newSpeakers.deviceId,
      });

      setCurrentDevices((prev) => ({ ...prev, speaker: newSpeakers }));
    },
    [callObject, currentDevices]
  );

  useEffect(() => {
    if (!callObject) return false;

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
    cams,
    mics,
    speakers,
    camError,
    micError,
    currentDevices,
    deviceState,
    setCamDevice,
    setMicDevice,
    setSpeakersDevice,
  };
};

export default useDevices;
