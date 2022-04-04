import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useWaitingParticipants } from '@daily-co/daily-react-hooks';
import PropTypes from 'prop-types';

const WaitingRoomContext = createContext(null);

export const WaitingRoomProvider = ({ children }) => {
  const { waitingParticipants, grantAccess, denyAccess } =
    useWaitingParticipants();
  const [showModal, setShowModal] = useState(false);

  const multipleWaiting = useMemo(
    () => waitingParticipants.length > 1,
    [waitingParticipants]
  );

  useEffect(() => {
    if (waitingParticipants.length === 0) {
      setShowModal(false);
    }
  }, [waitingParticipants]);

  return (
    <WaitingRoomContext.Provider
      value={{
        denyAccess,
        grantAccess,
        setShowModal,
        showModal,
        waitingParticipants,
        multipleWaiting,
      }}
    >
      {children}
    </WaitingRoomContext.Provider>
  );
};

WaitingRoomProvider.propTypes = {
  children: PropTypes.node,
};

export const useWaitingRoom = () => useContext(WaitingRoomContext);