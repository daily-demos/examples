import { useDeepCompareEffect } from 'use-deep-compare';
import { useTracks } from '../contexts/TracksProvider';

/**
 * Updates cam subscriptions based on passed ids and pausedIds.
 * @param ids Participant ids which should be subscribed to.
 * @param pausedIds Participant ids which should be subscribed, but paused.
 * @param delay Throttle in milliseconds. Default: 50
 */
export const useCamSubscriptions = (ids, pausedIds = [], throttle = 50) => {
  const { updateCamSubscriptions } = useTracks();

  useDeepCompareEffect(() => {
    if (!ids || !pausedIds) return false;
    const timeout = setTimeout(() => {
      updateCamSubscriptions(ids, pausedIds);
    }, throttle);
    return () => {
      clearTimeout(timeout);
    };
  }, [ids, pausedIds, throttle, updateCamSubscriptions]);
};

export default useCamSubscriptions;
