import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

export const UIStateContext = createContext();

export const UIStateProvider = ({ asides, children }) => {
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showAside, setShowAside] = useState();

  return (
    <UIStateContext.Provider
      value={{
        asides,
        showDeviceModal,
        setShowDeviceModal,
        showAside,
        setShowAside,
      }}
    >
      {children}
    </UIStateContext.Provider>
  );
};

UIStateProvider.propTypes = {
  children: PropTypes.node,
  asides: PropTypes.arrayOf(PropTypes.func),
};

export const useUIState = () => useContext(UIStateContext);
