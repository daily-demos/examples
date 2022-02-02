import { useCallback, useEffect, useRef, useState } from 'react';
import { useCallState } from '../contexts/CallProvider';

const STANDARD_HIGH_BITRATE_CAP = 980;
const STANDARD_LOW_BITRATE_CAP = 300;

export const useNetworkState = (
  co = null,
  quality = 'high'
) => {
  const [threshold, setThreshold] = useState('good');
  const lastSetKBS = useRef(null);

  const callState = useCallState();

  const callObject = co ?? callState?.callObject;

  const setQuality = useCallback(
    async (q) => {
      if (!callObject) return;
      const peers = Object.keys(callObject.participants()).length - 1;
      const isSFU = (await callObject.getNetworkTopology()).topology === 'sfu';
      const lowKbs = isSFU
        ? STANDARD_LOW_BITRATE_CAP
        : Math.floor(STANDARD_LOW_BITRATE_CAP / Math.max(1, peers));
      const highKbs = isSFU
        ? STANDARD_HIGH_BITRATE_CAP
        : Math.floor(STANDARD_HIGH_BITRATE_CAP / Math.max(1, peers));

      switch (q) {
        case 'auto':
        case 'high':
          if (lastSetKBS.current === highKbs) break;
          callObject.setBandwidth({
            kbs: highKbs,
          });
          lastSetKBS.current = highKbs;
          break;
        case 'low':
          if (lastSetKBS.current === lowKbs) break;
          callObject.setBandwidth({
            kbs: lowKbs,
          });
          lastSetKBS.current = lowKbs;
          break;
        case 'bandwidth-saver':
          callObject.setLocalVideo(false);
          if (lastSetKBS.current === lowKbs) break;
          callObject.setBandwidth({
            kbs: lowKbs,
          });
          lastSetKBS.current = lowKbs;
          break;
      }
    },
    [callObject]
  );

  const handleNetworkQualityChange = useCallback(
    (ev) => {
      if (ev.threshold === threshold) return;

      switch (ev.threshold) {
        case 'very-low':
          setQuality('bandwidth-saver');
          setThreshold('very-low');
          break;
        case 'low':
          setQuality(quality === 'bandwidth-saver' ? quality : 'low');
          setThreshold('low');
          break;
        case 'good':
          setQuality(
            ['bandwidth-saver', 'low'].includes(quality) ? quality : 'high'
          );
          setThreshold('good');
          break;
      }
    },
    [quality, setQuality, threshold]
  );

  useEffect(() => {
    if (!callObject) return;
    callObject.on('network-quality-change', handleNetworkQualityChange);
    return () => {
      callObject.off('network-quality-change', handleNetworkQualityChange);
    };
  }, [callObject, handleNetworkQualityChange]);

  useEffect(() => {
    if (!callObject) return;
    setQuality(quality);
    let timeout;
    const handleParticipantCountChange = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setQuality(quality);
      }, 500);
    };
    callObject.on('participant-joined', handleParticipantCountChange);
    callObject.on('participant-left', handleParticipantCountChange);
    return () => {
      callObject.off('participant-joined', handleParticipantCountChange);
      callObject.off('participant-left', handleParticipantCountChange);
    };
  }, [callObject, quality, setQuality]);

  return threshold;
};