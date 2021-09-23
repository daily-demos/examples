import { useEffect, useState } from 'react';

/**
 * Takes a ref to the scrolling element in ParticipantBar.
 * Observes DOM changes and returns true, if a TileActions menu is opened.
 * @returns boolean
 */
export const useBlockScrolling = (scrollRef) => {
  const [blockScrolling, setBlockScrolling] = useState(false);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || typeof MutationObserver === 'undefined') return false;

    const observer = new MutationObserver((mutations) => {
      if (!scrollEl) return;
      mutations.forEach((m) => {
        const { target } = m;
        if (
          m.attributeName === 'class' &&
          target.classList.contains('tile-actions') &&
          scrollEl.scrollHeight > scrollEl.clientHeight
        ) {
          setBlockScrolling(target.classList.contains('showMenu'));
        }
      });
    });

    observer.observe(scrollEl, {
      attributes: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [scrollRef]);

  return blockScrolling;
};

export default useBlockScrolling;
