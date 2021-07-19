import { useEffect, useMemo } from 'react';

import { debounce } from 'debounce';
import { useCallState } from '../contexts/CallProvider';
import { useSound } from './useSound';

/**
 * Convenience hook to play `join.mp3` when participants join the call
 */
export const useJoinSound = () => {
  const { callObject } = useCallState();
  const { load, play } = useSound('assets/join.mp3');

  useEffect(() => {
    load();
  }, [load]);

  const debouncedPlay = useMemo(() => debounce(() => play(), 200), [play]);

  useEffect(() => {
    if (!callObject) return false;

    const handleParticipantJoined = () => {
      debouncedPlay();
    };

    callObject.on('participant-joined', handleParticipantJoined);

    setTimeout(() => {
      handleParticipantJoined();
    }, 2000);

    return () => {
      callObject.off('participant-joined', handleParticipantJoined);
    };
  }, [callObject, debouncedPlay]);
};

export default useJoinSound;
