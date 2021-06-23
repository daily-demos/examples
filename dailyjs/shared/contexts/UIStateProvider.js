import React, { useCallback, createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

export const UIStateContext = createContext();

export const UIStateProvider = ({ asides, customTrayComponent, children }) => {
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showAside, setShowAside] = useState();

  const toggleAside = useCallback((newAside) => {
    setShowAside((p) => (p === newAside ? null : newAside));
  }, []);

  return (
    <UIStateContext.Provider
      value={{
        asides,
        customTrayComponent,
        showDeviceModal,
        setShowDeviceModal,
        toggleAside,
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
  customTrayComponent: PropTypes.node,
};

export const useUIState = () => useContext(UIStateContext);
