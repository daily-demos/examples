import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { useUIState, VIEW_MODE_SPEAKER, VIEW_MODE_GRID } from '@custom/shared/contexts/UIStateProvider';
import { useSharedState } from '@custom/shared/hooks/useSharedState';
import PropTypes from 'prop-types';

export const PRE_CLASS_LOBBY = 'Pre-class lobby';
export const CLASS_IN_SESSION = 'Class-in session';
export const POST_CLASS_LOBBY = 'Post-class lobby';

export const ClassStateContext = createContext();

export const ClassStateProvider = ({ children }) => {
  const { setPreferredViewMode } = useUIState();

  const { sharedState, setSharedState } = useSharedState({
    initialValues: { type: PRE_CLASS_LOBBY },
  });

  const classType = useMemo(() => sharedState.type, [sharedState.type]);

  const setClassType = useCallback(() => {
    if (sharedState.type === PRE_CLASS_LOBBY) setSharedState({ type: CLASS_IN_SESSION });
    if (sharedState.type === CLASS_IN_SESSION) setSharedState({ type: POST_CLASS_LOBBY });
  }, [sharedState.type, setSharedState]);

  useEffect(() => {
    if (sharedState.type === CLASS_IN_SESSION) setPreferredViewMode(VIEW_MODE_SPEAKER);
    else setPreferredViewMode(VIEW_MODE_GRID);
  }, [setPreferredViewMode, sharedState.type]);

  return (
    <ClassStateContext.Provider value={{ classType, setClassType }}>
      {children}
    </ClassStateContext.Provider>
  );
};

ClassStateProvider.propTypes = {
  children: PropTypes.node,
};

export const useClassState = () => useContext(ClassStateContext);