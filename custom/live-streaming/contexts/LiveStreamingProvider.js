import React, { createContext, useContext } from 'react';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { useLiveStreaming as useDailyLiveStreaming } from '@daily-co/daily-react-hooks';
import PropTypes from 'prop-types';

export const LiveStreamingContext = createContext();

export const LiveStreamingProvider = ({ children }) => {
  const { setCustomCapsule } = useUIState();

  const {
    isLiveStreaming,
    errorMsg,
    startLiveStreaming,
    updateLiveStreaming,
    stopLiveStreaming,
  } = useDailyLiveStreaming({
    onLiveStreamingStarted: () =>
      setCustomCapsule({ variant: 'recording', label: 'Live streaming' }),
    onLiveStreamingStopped: () => setCustomCapsule(null),
    onLiveStreamingError: () => setCustomCapsule(null),
  });

  return (
    <LiveStreamingContext.Provider
      value={{
        isLiveStreaming,
        errorMsg,
        startLiveStreaming,
        updateLiveStreaming,
        stopLiveStreaming,
      }}
    >
      {children}
    </LiveStreamingContext.Provider>
  );
};

LiveStreamingProvider.propTypes = {
  children: PropTypes.node,
};

export const useLiveStreaming = () => useContext(LiveStreamingContext);
