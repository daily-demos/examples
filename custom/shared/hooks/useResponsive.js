import React, { useEffect, useState } from 'react';

let responsiveConfig = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState(window.innerWidth);

  const handleChangeWindowSize = () => setWindowSize(window.innerWidth);

  const getResponsiveConfig = (size) => {
    const responsive = {};
    Object.keys(responsiveConfig).forEach(config => {
      responsive[config] = size > responsiveConfig[config];
    });
    return responsive;
  };

  const isMobile = () => {
    const config = getResponsiveConfig(windowSize);
    return !config.md && !config.lg && !config.xl;
  };

  useEffect(() => {
    window.addEventListener('resize', handleChangeWindowSize);

    return () => {
      window.removeEventListener('resize', handleChangeWindowSize);
    };
  }, []);

  return { config: getResponsiveConfig(windowSize), isMobile };
};