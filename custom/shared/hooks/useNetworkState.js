/* global rtcpeers */
import { useCallback, useEffect, useState } from 'react';

import {
  VIDEO_QUALITY_HIGH,
  VIDEO_QUALITY_LOW,
  VIDEO_QUALITY_BANDWIDTH_SAVER,
} from '../constants';

export const NETWORK_STATE_GOOD = 'good';
export const NETWORK_STATE_LOW = 'low';
export const NETWORK_STATE_VERY_LOW = 'very-low';
const STANDARD_HIGH_BITRATE_CAP = 980;
const STANDARD_LOW_BITRATE_CAP = 300;

export const useNetworkState = (
  callObject = null,
  quality = VIDEO_QUALITY_HIGH
) => {
  const [threshold, setThreshold] = useState(NETWORK_STATE_GOOD);

  const setQuality = useCallback(
    (q) => {
      if (!callObject || typeof rtcpeers === 'undefined') return;

      const peers = Object.keys(callObject.participants()).length - 1;
      const isSFU = rtcpeers?.currentlyPreferred?.typeName?.() === 'sfu';

      const lowKbs = isSFU
        ? STANDARD_LOW_BITRATE_CAP
        : STANDARD_LOW_BITRATE_CAP / Math.max(1, peers);

      switch (q) {
        case VIDEO_QUALITY_HIGH:
          callObject.setBandwidth({ kbs: STANDARD_HIGH_BITRATE_CAP });
          break;
        case VIDEO_QUALITY_LOW:
          callObject.setBandwidth({
            kbs: lowKbs,
          });
          break;
        case VIDEO_QUALITY_BANDWIDTH_SAVER:
          callObject.setLocalVideo(false);
          callObject.setBandwidth({
            kbs: lowKbs,
          });
          break;
        default:
          break;
      }
    },
    [callObject]
  );

  const handleNetworkQualityChange = useCallback(
    (ev) => {
      if (ev.threshold === threshold) return;

      switch (ev.threshold) {
        case NETWORK_STATE_VERY_LOW:
          setQuality(VIDEO_QUALITY_BANDWIDTH_SAVER);
          setThreshold(NETWORK_STATE_VERY_LOW);
          break;
        case NETWORK_STATE_LOW:
          setQuality(
            quality === VIDEO_QUALITY_BANDWIDTH_SAVER
              ? quality
              : NETWORK_STATE_LOW
          );
          setThreshold(NETWORK_STATE_LOW);
          break;
        case NETWORK_STATE_GOOD:
          setQuality(
            [VIDEO_QUALITY_BANDWIDTH_SAVER, VIDEO_QUALITY_LOW].includes(quality)
              ? quality
              : VIDEO_QUALITY_HIGH
          );
          setThreshold(NETWORK_STATE_GOOD);
          break;
        default:
          break;
      }
    },
    [setQuality, threshold, quality]
  );

  useEffect(() => {
    if (!callObject) return false;
    callObject.on('network-quality-change', handleNetworkQualityChange);
    return () =>
      callObject.off('network-quality-change', handleNetworkQualityChange);
  }, [callObject, handleNetworkQualityChange]);

  useEffect(() => {
    setQuality(quality);
  }, [quality, setQuality]);

  return threshold;
};
