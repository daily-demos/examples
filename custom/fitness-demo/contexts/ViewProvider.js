import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { useSharedState } from '@custom/shared/hooks/useSharedState';
import PropTypes from 'prop-types';

export const ViewContext = createContext();

export const ViewProvider = ({ children }) => {
  const { viewMode, setPreferredViewMode } = useUIState();

  const { sharedState, setSharedState } = useSharedState({
    initialValues: { viewMode },
  });

  const view = useMemo(() => sharedState.viewMode, [sharedState.viewMode]);
  const setView = useCallback((view) => setSharedState({ viewMode: view }), [setSharedState]);

  useEffect(() => {
    if (viewMode === sharedState.viewMode) return;
    setPreferredViewMode(sharedState.viewMode);
  }, [setPreferredViewMode, sharedState.viewMode, viewMode]);

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
};

ViewProvider.propTypes = {
  children: PropTypes.node,
};

export const useView = () => useContext(ViewContext);