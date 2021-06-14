import React, { useEffect, useState } from 'react';

import { useCallState } from '../../contexts/CallProvider';
import { useWaitingRoom } from '../../contexts/WaitingRoomProvider';
import { Button } from '../Button';

export const WaitingRoomNotification = () => {
  const { callObject } = useCallState();
  const {
    denyAccess,
    grantAccess,
    showModal,
    setShowModal,
    waitingParticipants,
  } = useWaitingRoom();
  const [showNotification, setShowNotification] = useState(false);

  /**
   * Show notification when waiting participants change.
   */
  useEffect(() => {
    if (showModal) return false;

    const handleWaitingParticipantAdded = () => {
      setShowNotification(
        Object.keys(callObject.waitingParticipants()).length > 0
      );
    };

    callObject.on('waiting-participant-added', handleWaitingParticipantAdded);
    return () => {
      callObject.off(
        'waiting-participant-added',
        handleWaitingParticipantAdded
      );
    };
  }, [callObject, showModal]);

  /**
   * Hide notification when people panel is opened.
   */
  useEffect(() => {
    if (showModal) setShowNotification(false);
  }, [showModal]);

  if (!showNotification || waitingParticipants.length === 0) return null;

  const hasMultiplePeopleWaiting = waitingParticipants.length > 1;

  const handleViewAllClick = () => {
    setShowModal(true);
    setShowNotification(false);
  };
  const handleAllowClick = () => {
    grantAccess(waitingParticipants[0].id);
  };
  const handleDenyClick = () => {
    denyAccess(hasMultiplePeopleWaiting ? 'all' : waitingParticipants[0].id);
  };
  const handleClose = () => setShowNotification(false);

  return (
    <div className="waiting-room-notification">
      <>
        {hasMultiplePeopleWaiting ? (
          <Button onClick={handleViewAllClick}>View all</Button>
        ) : (
          <Button onClick={handleAllowClick}>Allow</Button>
        )}
        <Button onClick={handleDenyClick} variant="secondary">
          {hasMultiplePeopleWaiting
            ? 'waitingRoom.denyAll'
            : 'waitingRoom.deny'}
        </Button>
        <Button onClick={handleClose} variant="ghost">
          Close
        </Button>
      </>

      <style jsx>{`
        .waiting-room-notification {
          position: absolute;
          right: var(--spacing-sm);
          top: var(--spacing-sm);
          background: red;
        }
      `}</style>
    </div>
  );
};

export default WaitingRoomNotification;
