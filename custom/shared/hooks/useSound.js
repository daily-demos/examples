import { useCallback, useEffect, useRef } from 'react';

export const useSound = (src) => {
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

  const play = useCallback(() => {
    if (!audio.current) return;
    try {
      audio.current.currentTime = 0;
      audio.current.play();
    } catch (e) {
      console.error(e);
    }
  }, [audio]);

  return { load, play };
};

export default useSound;
