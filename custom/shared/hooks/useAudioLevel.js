import { useEffect, useState } from 'react';

export const useAudioLevel = (sessionId) => {
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      return false;
    }

    const i = setInterval(async () => {
      try {
        if (!(window.rtcpeers && window.rtcpeers.sfu)) {
          return;
        }
        const consumer =
          window.rtcpeers.sfu.consumers[`${sessionId}/cam-audio`];
        if (!(consumer && consumer.getStats)) {
          return;
        }
        const level = Array.from((await consumer.getStats()).values()).find(
          (s) => 'audioLevel' in s
        ).audioLevel;
        setAudioLevel(level);
      } catch (e) {
        console.error(e);
      }
    }, 2000);

    return () => clearInterval(i);
  }, [sessionId]);

  return audioLevel;
};

export default useAudioLevel;
