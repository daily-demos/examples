import { useDeepCompareMemo } from 'use-deep-compare';

import { useTracks } from '../contexts/TracksProvider';

export const useAudioTrack = (participant) => {
  const { audioTracks } = useTracks();

  return useDeepCompareMemo(() => {
    const audioTrack = audioTracks?.[participant?.id];
    // @ts-ignore
    return audioTrack?.persistentTrack;
  }, [participant?.id, audioTracks]);
};

export default useAudioTrack;
