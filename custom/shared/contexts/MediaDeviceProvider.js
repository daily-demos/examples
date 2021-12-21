import React, { createContext, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';

import { useCallState } from './CallProvider';
import { useParticipants } from './ParticipantsProvider';
import { useDevices } from './useDevices';

export const MediaDeviceContext = createContext();

export const MediaDeviceProvider = ({ children }) => {
  const { callObject } = useCallState();
  const { localParticipant } = useParticipants();

  const {
    camError,
    cams,
    currentCam,
    currentMic,
    currentSpeaker,
    deviceState,
    micError,
    mics,
    refreshDevices,
    setCurrentCam,
    setCurrentMic,
    setCurrentSpeaker,
    speakers,
  } = useDevices(callObject);

  const selectCamera = useCallback(
    async (newCam) => {
      if (!callObject || newCam.deviceId === currentCam?.deviceId) return;
      const { camera } = await callObject.setInputDevicesAsync({
        videoDeviceId: newCam.deviceId,
      });
      setCurrentCam(camera);
    },
    [callObject, currentCam, setCurrentCam]
  );

  const selectMic = useCallback(
    async (newMic) => {
      if (!callObject || newMic.deviceId === currentMic?.deviceId) return;
      const { mic } = await callObject.setInputDevicesAsync({
        audioDeviceId: newMic.deviceId,
      });
      setCurrentMic(mic);
    },
    [callObject, currentMic, setCurrentMic]
  );

  const selectSpeaker = useCallback(
    (newSpeaker) => {
      if (!callObject || newSpeaker.deviceId === currentSpeaker?.deviceId) return;
      callObject.setOutputDevice({
        outputDeviceId: newSpeaker.deviceId,
      });
      setCurrentSpeaker(newSpeaker);
    },
    [callObject, currentSpeaker, setCurrentSpeaker]
  );

  return (
    <MediaDeviceContext.Provider
      value={{
        camError,
        cams,
        currentCam,
        currentMic,
        currentSpeaker,
        deviceState,
        isCamMuted: localParticipant.isCamMuted,
        isMicMuted: localParticipant.isMicMuted,
        micError,
        mics,
        refreshDevices,
        setCurrentCam: selectCamera,
        setCurrentMic: selectMic,
        setCurrentSpeaker: selectSpeaker,
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
