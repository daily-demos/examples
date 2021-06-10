import React, { useState, useEffect, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

import { useCallState } from './CallProvider';
import { useDevices } from './useDevices';

export const MediaDeviceContext = createContext();

export const MediaDeviceProvider = ({ children }) => {
  const { callObject } = useCallState();
  const [isCamMuted, setIsCamMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);

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

  useEffect(() => {
    if (!callObject) return false;

    const handleNewDeviceState = () => {
      setIsCamMuted(!callObject.participants()?.local?.video);
      setIsMicMuted(!callObject.participants()?.local?.audio);
    };

    callObject.on('participant-updated', handleNewDeviceState);
    return () => {
      callObject.off('participant-updated', handleNewDeviceState);
    };
  }, [callObject]);

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
        isCamMuted,
        isMicMuted,
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
