import { useCallback, useEffect, useRef } from 'react';

const defaultNotMuted = () => false;

export const useSound = (src, isMuted = defaultNotMuted) => {
  const audio = useRef(null);

  useEffect(() => {
    const tag = document.querySelector(`audio[src="${src}"]`);

    if (tag) {
      audio.current = tag;
    } else {
      const t = document.createElement('audio');
      t.src = src;
      t.setAttribute('playsinline', '');
      document.body.appendChild(t);
      audio.current = t;
    }
  }, [src]);

  const load = useCallback(() => {
    if (!audio.current) return;
    audio.current.load();
  }, [audio]);

  const play = useCallback(async () => {
    if (!audio.current || isMuted()) return;
    try {
      audio.current.currentTime = 0;
      await audio.current.play();
    } catch (e) {
      console.error(e);
    }
  }, [audio, isMuted]);

  return { load, play };
};
