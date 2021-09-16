import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

import { useCallState } from './CallProvider';
import { useParticipants } from './ParticipantsProvider';
import { useDevices } from './useDevices';

export const MediaDeviceContext = createContext();

export const MediaDeviceProvider = ({ children }) => {
  const { callObject } = useCallState();
  const { localParticipant } = useParticipants();

  const {
    cams,
    mics,
    speakers,
    camError,
    micError,
    currentDevices,
    deviceState,
    setMicDevice,
    setCamDevice,
    setSpeakersDevice,
  } = useDevices(callObject);

  return (
    <MediaDeviceContext.Provider
      value={{
        cams,
        mics,
        speakers,
        camError,
        micError,
        currentDevices,
        deviceState,
        isCamMuted: localParticipant.isCamMuted,
        isMicMuted: localParticipant.isMicMuted,
        setMicDevice,
        setCamDevice,
        setSpeakersDevice,
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
