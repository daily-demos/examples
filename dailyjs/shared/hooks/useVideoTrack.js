import { useDeepCompareMemo } from 'use-deep-compare';
import { useTracks } from '../contexts/TracksProvider';
import { DEVICE_STATE_BLOCKED, DEVICE_STATE_OFF } from '../contexts/useDevices';

export const useVideoTrack = (participant) => {
  const { videoTracks } = useTracks();

  return useDeepCompareMemo(() => {
    const videoTrack = videoTracks?.[participant?.id];
    if (
      videoTrack?.state === DEVICE_STATE_OFF ||
      videoTrack?.state === DEVICE_STATE_BLOCKED ||
      (!videoTrack?.subscribed &&
        participant?.id !== 'local' &&
        !participant.isScreenshare)
    )
      return null;
    return videoTrack?.persistentTrack;
  }, [participant?.id, videoTracks]);
};

export default useVideoTrack;
