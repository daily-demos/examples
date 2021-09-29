import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import PropTypes from 'prop-types';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const { callObject } = useCallState();

  // -- State
  const [streamObject, setStreamObject] = useState(null);
  const [error, setError] = useState();

  // -- Methods

  const startMusic = useCallback(async () => {
    if (!callObject) {
      return;
    }

    // Note: browsers do not support getting display media without video
    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          // Specify stereo
          channels: 2,
          // Turn off AGC and noise suppression for pure audio output
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
        },
      });
    } catch {
      setError('Display media cancelled / permission denied');
    }

    if (!stream.getAudioTracks().length) {
      setError('Unable to retrieve display media');
      return;
    }

    setStreamObject(stream);

    // Start custom track using screen audio track (in music mode for HQ audio)
    const customTrack = await window.betaStartCustomTrack({
      track: stream.getAudioTracks()[0],
      mode: 'music',
    });

    return customTrack;
  }, [callObject]);

  return (
    <MusicContext.Provider value={{ startMusic, error }}>
      {children}
    </MusicContext.Provider>
  );
};

MusicProvider.propTypes = {
  children: PropTypes.node,
};

export const useMusic = () => useContext(MusicContext);
