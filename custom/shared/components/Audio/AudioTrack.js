import React, { useRef, useEffect } from 'react';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import PropTypes from 'prop-types';

export const AudioTrack = ({ track }) => {
  const audioRef = useRef(null);
  const { setShowAutoplayFailedModal } = useUIState();

  useEffect(() => {
    const audioTag = audioRef.current;
    if (!audioTag) return false;
    let playTimeout;

    const handleCanPlay = () => {
      playTimeout = setTimeout(() => {
        setShowAutoplayFailedModal(true);
      }, 1500);
    };
    const handlePlay = () => {
      clearTimeout(playTimeout);
    };
    audioTag.addEventListener('canplay', handleCanPlay);
    audioTag.addEventListener('play', handlePlay);
    audioTag.srcObject = new MediaStream([track]);

    return () => {
      audioTag?.removeEventListener('canplay', handleCanPlay);
      audioTag?.removeEventListener('play', handlePlay);
    };
  }, [setShowAutoplayFailedModal, track]);

  return track ? <audio autoPlay playsInline ref={audioRef} /> : null;
};

AudioTrack.propTypes = {
  track: PropTypes.object,
};

export default AudioTrack;
