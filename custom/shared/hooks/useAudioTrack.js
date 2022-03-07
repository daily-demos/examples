import { useDeepCompareMemo } from 'use-deep-compare';

import { useTracks } from '../contexts/TracksProvider';

export const useAudioTrack = (id) => {
  const { audioTracks } = useTracks();

  return useDeepCompareMemo(() => {
    const audioTrack = audioTracks?.[id];
    return audioTrack?.persistentTrack;
  }, [id, audioTracks]);
};

export default useAudioTrack;