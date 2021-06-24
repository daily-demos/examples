import React, { useCallback, createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useDeepCompareMemo } from 'use-deep-compare';

export const UIStateContext = createContext();

export const UIStateProvider = ({
  asides,
  modals,
  customTrayComponent,
  children,
}) => {
  const [showAside, setShowAside] = useState();
  const [activeModals, setActiveModals] = useState({});

  const openModal = useCallback((modalName) => {
    setActiveModals((prevState) => ({
      ...prevState,
      [modalName]: true,
    }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setActiveModals((prevState) => ({
      ...prevState,
      [modalName]: false,
    }));
  }, []);

  const currentModals = useDeepCompareMemo(() => activeModals, [activeModals]);

  const toggleAside = useCallback((newAside) => {
    setShowAside((p) => (p === newAside ? null : newAside));
  }, []);

  return (
    <UIStateContext.Provider
      value={{
        asides,
        modals,
        customTrayComponent,
        openModal,
        closeModal,
        currentModals,
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
  modals: PropTypes.arrayOf(PropTypes.func),
  customTrayComponent: PropTypes.node,
};

export const useUIState = () => useContext(UIStateContext);
