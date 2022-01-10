import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useCallState } from './CallProvider';

const WaitingRoomContext = createContext(null);

export const WaitingRoomProvider = ({ children }) => {
  const { callObject } = useCallState();
  const [waitingParticipants, setWaitingParticipants] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleWaitingParticipantEvent = useCallback(() => {
    if (!callObject) return;

    const waiting = Object.entries(callObject.waitingParticipants());

    console.log(`🚪 ${waiting.length} participant(s) waiting for access`);

    setWaitingParticipants((wp) =>
      waiting.map(([pid, p]) => {
        const prevWP = wp.find(({ id }) => id === pid);
        return {
          ...p,
          joinDate: prevWP?.joinDate ?? new Date(),
        };
      })
    );
  }, [callObject]);

  const multipleWaiting = useMemo(() => waitingParticipants.length > 1, [
    waitingParticipants,
  ]);

  useEffect(() => {
    if (waitingParticipants.length === 0) {
      setShowModal(false);
    }
  }, [waitingParticipants]);

  useEffect(() => {
    if (!callObject) return false;

    console.log('🚪 Waiting room provider listening for requests');

    const events = [
      'waiting-participant-added',
      'waiting-participant-updated',
      'waiting-participant-removed',
    ];

    events.forEach((e) => callObject.on(e, handleWaitingParticipantEvent));

    return () =>
      events.forEach((e) => callObject.off(e, handleWaitingParticipantEvent));
  }, [callObject, handleWaitingParticipantEvent]);

  const updateWaitingParticipant = (id, grantRequestedAccess) => {
    if (!waitingParticipants.some((p) => p.id === id)) return;
    callObject.updateWaitingParticipant(id, {
      grantRequestedAccess,
    });
    setWaitingParticipants((wp) => wp.filter((p) => p.id !== id));
  };

  const updateAllWaitingParticipants = (grantRequestedAccess) => {
    if (!waitingParticipants.length) return;
    callObject.updateWaitingParticipants({
      '*': {
        grantRequestedAccess,
      },
    });
    setWaitingParticipants([]);
  };

  const grantAccess = (id = 'all') => {
    if (id === 'all') {
      updateAllWaitingParticipants(true);
      return;
    }
    updateWaitingParticipant(id, true);
  };
  const denyAccess = (id = 'all') => {
    if (id === 'all') {
      updateAllWaitingParticipants(false);
      return;
    }
    updateWaitingParticipant(id, false);
  };

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
