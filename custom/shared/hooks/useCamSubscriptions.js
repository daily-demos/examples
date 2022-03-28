import { useDeepCompareEffect } from 'use-deep-compare';
import { useTracks } from '../contexts/TracksProvider';

/**
 * Updates cam subscriptions based on passed subscribedIds and stagedIds.
 * @param subscribedIds Participant ids whose cam tracks should be subscribed to.
 * @param stagedIds Participant ids whose cam tracks should be staged.
 * @param delay Throttle in milliseconds. Default: 50
 */
export const useCamSubscriptions = (
  subscribedIds,
  stagedIds = [],
  throttle = 50
) => {
  const { updateCamSubscriptions } = useTracks();

  useDeepCompareEffect(() => {
    if (!subscribedIds || !stagedIds) return;
    const timeout = setTimeout(() => {
      updateCamSubscriptions(subscribedIds, stagedIds);
    }, throttle);
    return () => clearTimeout(timeout);
  }, [subscribedIds, stagedIds, throttle, updateCamSubscriptions]);
};
