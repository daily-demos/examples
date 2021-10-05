import { useEffect, useState } from 'react';

export const useScrollbarWidth = () => {
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    // Create fake div to determine if scrollbar is rendered inside or outside
    const div = document.createElement('div');
    div.style.width = '100px';
    div.style.height = '1px';
    div.style.position = 'absolute';
    div.style.left = '-9999em';
    div.style.top = '-9999em';
    div.style.overflow = 'auto';
    div.setAttribute('aria-hidden', 'true');
    const child = document.createElement('div');
    child.textContent = 'This is a test div.';
    div.appendChild(child);
    document.body.appendChild(div);
    const autoWidth = child.clientWidth;
    div.style.overflow = 'hidden';
    const hiddenWidth = child.clientWidth;
    setScrollbarWidth(hiddenWidth - autoWidth);
    div.remove();
  }, []);

  return scrollbarWidth;
};

export default useScrollbarWidth;
