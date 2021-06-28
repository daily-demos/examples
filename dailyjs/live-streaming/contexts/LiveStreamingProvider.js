import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import PropTypes from 'prop-types';

export const LiveStreamingContext = createContext();

export const LiveStreamingProvider = ({ children }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState();
  const { setCustomCapsule } = useUIState();
  const { callObject } = useCallState();

  const handleStreamStarted = useCallback(() => {
    console.log('📺 Live stream started');
    setIsStreaming(true);
    setStreamError(null);
    setCustomCapsule({ variant: 'recording', label: 'Live streaming' });
  }, [setCustomCapsule]);

  const handleStreamStopped = useCallback(() => {
    console.log('📺 Live stream stopped');
    setIsStreaming(false);
    setCustomCapsule(null);
  }, [setCustomCapsule]);

  const handleStreamError = useCallback(
    (e) => {
      setIsStreaming(false);
      setCustomCapsule(null);
      setStreamError(e.errorMsg);
    },
    [setCustomCapsule]
  );

  useEffect(() => {
    if (!callObject) {
      return false;
    }

    console.log('📺 Live streaming provider listening for stream events');

    callObject.on('live-streaming-started', handleStreamStarted);
    callObject.on('live-streaming-stopped', handleStreamStopped);
    callObject.on('live-streaming-error', handleStreamError);

    return () => {
      callObject.off('live-streaming-started', handleStreamStarted);
      callObject.off('live-streaming-stopped', handleStreamStopped);
      callObject.on('live-streaming-error', handleStreamError);
    };
  }, [callObject, handleStreamStarted, handleStreamStopped, handleStreamError]);

  return (
    <LiveStreamingContext.Provider value={{ isStreaming, streamError }}>
      {children}
    </LiveStreamingContext.Provider>
  );
};

LiveStreamingProvider.propTypes = {
  children: PropTypes.node,
};

export const useLiveStreaming = () => useContext(LiveStreamingContext);
