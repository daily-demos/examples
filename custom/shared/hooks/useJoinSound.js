import { useEffect, useState } from 'react';

import { useCallState } from '../contexts/CallProvider';
import { useSoundLoader } from './useSoundLoader';

/**
 * Convenience hook to play `join.mp3` when first other participants joins.
 */
export const useJoinSound = () => {
  const { callObject: daily } = useCallState();
  const { joinSound } = useSoundLoader();
  const [playJoinSound, setPlayJoinSound] = useState(false);

  useEffect(() => {
    if (!daily) return;
    /**
     * We don't want to immediately play a joined sound, when the user joins the meeting:
     * Upon joining all other participants, that were already in-call, will emit a
     * participant-joined event.
     * In waiting 2 seconds we make sure, that the sound is only played when the user
     * is **really** the first participant.
     */
    setTimeout(() => {
      setPlayJoinSound(true);
    }, 2000);
  }, [daily]);

  useEffect(() => {
    if (!daily) return;
    const handleParticipantJoined = () => {
      // first other participant joined --> play sound
      if (!playJoinSound || Object.keys(daily.participants()).length !== 2)
        return;
      joinSound.play();
    };

    daily.on('participant-joined', handleParticipantJoined);
    return () => {
      daily.off('participant-joined', handleParticipantJoined);
    };
  }, [daily, joinSound, playJoinSound]);
};
