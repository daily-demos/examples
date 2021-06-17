/**
 * Audio
 * ---
 * Renders audio tags for each audible participant / screen share in the call
 * Note: it's very important to minimise DOM mutates for audio components
 * as iOS / Safari do a lot of browser 'magic' that may result in muted
 * tracks. We heavily memoize this component to avoid unnecassary re-renders.
 */
import React, { useRef, useEffect } from 'react';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import useAudioTrack from '@dailyjs/shared/hooks/useAudioTrack';
import PropTypes from 'prop-types';

const AudioItem = React.memo(
  ({ participant }) => {
    const audioRef = useRef(null);
    const audioTrack = useAudioTrack(participant);

    useEffect(() => {
      if (!audioTrack || !audioRef.current) return;

      // quick sanity to check to make sure this is an audio track...
      if (audioTrack.kind !== 'audio') return;

      audioRef.current.srcObject = new MediaStream([audioTrack]);
    }, [audioTrack]);

    useEffect(() => {
      // On iOS safari, when headphones are disconnected, all audio elements are paused.
      // This means that when a user disconnects their headphones, that user will not
      // be able to hear any other users until they mute/unmute their mics.
      // To fix that, we call `play` on each audio track on all devicechange events.
      if (audioRef.currenet) {
        return false;
      }
      const startPlayingTrack = () => {
        audioRef.current?.play();
      };

      navigator.mediaDevices.addEventListener(
        'devicechange',
        startPlayingTrack
      );

      return () =>
        navigator.mediaDevices.removeEventListener(
          'devicechange',
          startPlayingTrack
        );
    }, [audioRef]);

    return (
      <>
        <audio autoPlay playsInline ref={audioRef}>
          <track kind="captions" />
        </audio>
      </>
    );
  },
  () => true
);

AudioItem.propTypes = {
  participant: PropTypes.object,
};

export const Audio = React.memo(() => {
  const { allParticipants } = useParticipants();

  return (
    <>
      {allParticipants.map(
        (p) => !p.isLocal && <AudioItem participant={p} key={p.id} />
      )}
    </>
  );
});

export default Audio;
