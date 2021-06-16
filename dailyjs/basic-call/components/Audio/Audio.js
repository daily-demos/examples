import React, { useRef, useEffect } from 'react';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import useAudioTrack from '@dailyjs/shared/hooks/useAudioTrack';
import PropTypes from 'prop-types';

const AudioItem = React.memo(({ participant }) => {
  const audioRef = useRef(null);
  const audioTrack = useAudioTrack(participant);

  useEffect(() => {
    if (!audioTrack || !audioRef.current) return;

    // quick sanity to check to make sure this is an audio track...
    if (audioTrack.kind !== 'audio') return;

    audioRef.current.srcObject = new MediaStream([audioTrack]);
  }, [audioTrack]);

  return (
    <>
      <audio autoPlay playsInline ref={audioRef} id={participant.name}>
        <track kind="captions" />
      </audio>
    </>
  );
});

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
