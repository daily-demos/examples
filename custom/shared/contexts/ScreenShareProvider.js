import React, { createContext, useContext, useMemo } from 'react';
import { useScreenShare as useDailyScreenShare } from '@daily-co/daily-react-hooks';
import PropTypes from 'prop-types';

export const MAX_SCREEN_SHARES = 2;

const ScreenShareContext = createContext(null);

export const ScreenShareProvider = ({ children }) => {
  const {
    isSharingScreen,
    screens,
    startScreenShare,
    stopScreenShare
  } = useDailyScreenShare();

  const isDisabled = useMemo(() => screens.length >= MAX_SCREEN_SHARES && !isSharingScreen,
    [isSharingScreen, screens.length]
  );

  return (
    <ScreenShareContext.Provider
      value={{
        isSharingScreen,
        isDisabled,
        screens,
        startScreenShare,
        stopScreenShare,
      }}
    >
      {children}
    </ScreenShareContext.Provider>
  );
};

ScreenShareProvider.propTypes = {
  children: PropTypes.node,
};

export const useScreenShare = () => useContext(ScreenShareContext);
