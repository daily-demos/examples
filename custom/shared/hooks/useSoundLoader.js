import { useCallback, useMemo } from 'react';

import { useCallState } from '../contexts/CallProvider';
import { useSound } from './useSound';

export const useSoundLoader = () => {
  const { enableJoinSound } = useCallState();

  const isJoinSoundMuted = useCallback(
    () => !enableJoinSound,
    [enableJoinSound]
  );

  const joinSound = useSound(`assets/join.mp3`, isJoinSoundMuted);

  const load = useCallback(() => {
    joinSound.load();
  }, [joinSound]);

  return useMemo(
    () => ({ joinSound, load }),
    [joinSound, load]
  );
};