import React, { createContext, useContext, useMemo } from 'react';
import { useDaily, useDevices } from '@daily-co/daily-react-hooks';
import PropTypes from 'prop-types';

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

export const MediaDeviceContext = createContext();

export const MediaDeviceProvider = ({ children }) => {
  const {
    hasCamError,
    cameras,
    camState,
    setCamera,
    hasMicError,
    microphones,
    micState,
    setMicrophone,
    speakers,
    setSpeaker,
    refreshDevices,
  } = useDevices();

  const daily = useDaily();
  const localParticipant = daily?.participants().local;

  const isCamMuted = useMemo(() => {
    const videoState = localParticipant?.tracks?.video?.state;
    return videoState === DEVICE_STATE_OFF || videoState === DEVICE_STATE_BLOCKED || hasCamError;
  }, [hasCamError, localParticipant?.tracks?.video?.state]);

  const isMicMuted = useMemo(() => {
    const audioState = localParticipant?.tracks?.audio?.state;
    return audioState === DEVICE_STATE_OFF || audioState === DEVICE_STATE_BLOCKED || hasMicError;
  }, [hasMicError, localParticipant?.tracks?.audio?.state]);

  return (
    <MediaDeviceContext.Provider
      value={{
        isCamMuted,
        isMicMuted,
        camError: hasCamError,
        cams: cameras,
        camState,
        micError: hasMicError,
        mics: microphones,
        micState,
        refreshDevices,
        setCurrentCam: setCamera,
        setCurrentMic: setMicrophone,
        setCurrentSpeaker: setSpeaker,
        speakers,
      }}
    >
      {children}
    </MediaDeviceContext.Provider>
  );
};

MediaDeviceProvider.propTypes = {
  children: PropTypes.node,
};
MediaDeviceProvider.defaultProps = {
  children: null,
};

export const useMediaDevices = () => useContext(MediaDeviceContext);
