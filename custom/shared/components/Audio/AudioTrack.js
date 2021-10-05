import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const AudioTrack = ({ track }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return false;
    let playTimeout;

    const handleCanPlay = () => {
      playTimeout = setTimeout(() => {
        console.log('Unable to autoplay audio element');
      }, 1500);
    };
    const handlePlay = () => {
      clearTimeout(playTimeout);
    };
    audioRef.current.addEventListener('canplay', handleCanPlay);
    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.srcObject = new MediaStream([track]);

    const audioEl = audioRef.current;

    return () => {
      audioEl?.removeEventListener('canplay', handleCanPlay);
      audioEl?.removeEventListener('play', handlePlay);
    };
  }, [track]);

  return track ? (
    <audio autoPlay playsInline ref={audioRef}>
      <track kind="captions" />
    </audio>
  ) : null;
};

AudioTrack.propTypes = {
  track: PropTypes.object,
};

export default AudioTrack;
