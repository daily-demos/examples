import { useEffect, useRef } from 'react';
import {
  useAudioTrack,
  useScreenAudioTrack,
} from '@daily-co/daily-react-hooks';

import { useUIState } from '../../contexts/UIStateProvider';

export const AudioTrack = ({ sessionId }) => {
  const audioEl = useRef(null);
  const screenAudioEl = useRef(null);
  const { setShowAutoplayFailedModal } = useUIState();
  const audio = useAudioTrack(sessionId);
  const screenAudio = useScreenAudioTrack(sessionId);

  /**
   * Setup audio tag.
   */
  useEffect(() => {
    const audioTag = audioEl.current;
    if (!audioTag || audio?.isOff || !audio?.track) return;
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
    audioTag.srcObject = new MediaStream([audio?.track]);

    return () => {
      audioTag?.removeEventListener('canplay', handleCanPlay);
      audioTag?.removeEventListener('play', handlePlay);
    };
  }, [audio?.isOff, audio?.track, setShowAutoplayFailedModal]);

  /**
   * Setup screenAudio tag.
   */
  useEffect(() => {
    const screenAudioTag = screenAudioEl.current;
    if (!screenAudioTag || screenAudio?.isOff || !screenAudio?.track) return;
    let playTimeout;
    const handleCanPlay = () => {
      playTimeout = setTimeout(() => {
        setShowAutoplayFailedModal(true);
      }, 1500);
    };
    const handlePlay = () => {
      clearTimeout(playTimeout);
    };
    screenAudioTag.addEventListener('canplay', handleCanPlay);
    screenAudioTag.addEventListener('play', handlePlay);
    screenAudioTag.srcObject = new MediaStream([screenAudio?.track]);

    return () => {
      screenAudioTag?.removeEventListener('canplay', handleCanPlay);
      screenAudioTag?.removeEventListener('play', handlePlay);
    };
  }, [screenAudio?.isOff, screenAudio?.track, setShowAutoplayFailedModal]);

  return (
    <>
      {/**
       * We'll have to reserve 2 audio tracks for each participant, specifically in Safari.
       * Otherwise audio might not play, when the call is backgrounded.
       * Reserving an audio tag for screen shares with audio makes sure, that
       * screen share audio can play anytime a screenshare starts, independent of
       * wether the call is backgrounded or not.
       */}
      <audio autoPlay playsInline ref={audioEl} />
      <audio autoPlay playsInline ref={screenAudioEl} />
    </>
  );
};
