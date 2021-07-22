import React, { createContext, useContext, useEffect, useState } from 'react';

import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import PropTypes from 'prop-types';

export const CLASS_STATE_PRE_LOBBY = 'pre-lobby';
export const CLASS_STATE_IN_SESSION = 'in_session';
export const CLASS_STATE_POST_LOBBY = 'post-lobby';

const ClassStateContext = createContext();

export const ClassStateProvider = ({ children }) => {
  const [classState, setClassState] = useState(CLASS_STATE_PRE_LOBBY);

  const { isOwner } = useParticipants();

  useEffect(() => {
    console.log('🧘 Class provider initialised');
  }, []);

  return (
    <ClassStateContext.Provider
      value={{
        classState,
        setClassState,
      }}
    >
      {children}
    </ClassStateContext.Provider>
  );
};

ClassStateProvider.propTypes = {
  children: PropTypes.node,
};

export const useClassState = () => useContext(ClassStateContext);
