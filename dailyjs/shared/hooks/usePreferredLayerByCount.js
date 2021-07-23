/* global rtcpeers */

import { useEffect } from 'react';

/**
 * This hook will switch between one of the 3 simulcast layers
 * depending on the number of participants present on the call
 * to optimise bandwidth / cpu usage
 *
 * Note: the API for this feature is currently work in progress
 * and not documented. Momentarily we are using an internal
 * method `setPreferredLayerForTrack` found on the global
 * `rtcpeers` object.
 *
 * Note: this will have no effect when not in SFU mode
 */
export const usePreferredLayerByCount = (participants) => {
  /**
   * Set bandwidth layer based on amount of visible participants
   */
  useEffect(() => {
    if (typeof rtcpeers === 'undefined' || rtcpeers?.getCurrentType() !== 'sfu')
      return;

    const sfu = rtcpeers.soup;
    const count = participants.length;

    participants.forEach(({ id }) => {
      if (count < 5) {
        // High quality video for calls with < 5 people per page
        sfu.setPreferredLayerForTrack(id, 'cam-video', 2);
      } else if (count < 10) {
        // Medium quality video for calls with < 10 people per page
        sfu.setPreferredLayerForTrack(id, 'cam-video', 1);
      } else {
        // Low quality video for calls with 10 or more people per page
        sfu.setPreferredLayerForTrack(id, 'cam-video', 0);
      }
    });
  }, [participants]);
};

export default usePreferredLayerByCount;
