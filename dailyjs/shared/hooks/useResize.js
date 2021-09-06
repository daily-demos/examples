import { useCallback, useEffect } from 'react';

export const useResize = (callback, deps = []) => {
  let timeout;
  const handleResize = useCallback(() => {
    if (timeout) cancelAnimationFrame(timeout);
    timeout = requestAnimationFrame(() => callback());
  }, [callback]);
  useEffect(() => {
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, {
      passive: true,
    });
    callback();
    return () => {
      if (timeout) cancelAnimationFrame(timeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, deps);
};

export default useResize;
