import { useDeepCompareMemo } from 'use-deep-compare';

import { useTracks } from '../contexts/TracksProvider';
import { isLocalId, isScreenId } from '../contexts/participantsState';

export const useVideoTrack = (id) => {
  const { videoTracks } = useTracks();

  const videoTrack = useDeepCompareMemo(
    () => videoTracks?.[id],
    [id, videoTracks]
  );

  /**
   * MediaStreamTrack's are difficult to compare.
   * Changes to a video track's id will likely need to be reflected in the UI / DOM.
   * This usually happens on P2P / SFU switches.
   */
  return useDeepCompareMemo(() => {
    if (
      videoTrack?.state === 'off' ||
      videoTrack?.state === 'blocked' ||
      (!videoTrack?.subscribed && !isLocalId(id) && !isScreenId(id))
    )
      return null;
    return videoTrack?.persistentTrack;
  }, [id, videoTrack]);
};