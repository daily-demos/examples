import React, { useEffect, useState } from 'react';

import { useCallState } from '../../contexts/CallProvider';
import { useWaitingRoom } from '../../contexts/WaitingRoomProvider';
import { Button } from '../Button';
import { Card, CardBody, CardFooter } from '../Card';

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
  // const handleClose = () => setShowNotification(false);

  return (
    <Card className="waiting-room-notification">
      <CardBody>
        {hasMultiplePeopleWaiting
          ? `${waitingParticipants.length} people would like to join the call`
          : `${waitingParticipants[0].name} would like to join the call`}
      </CardBody>
      <CardFooter>
        {hasMultiplePeopleWaiting ? (
          <Button onClick={handleViewAllClick} size="small" variant="success">
            View all
          </Button>
        ) : (
          <Button onClick={handleAllowClick} size="small" variant="success">
            Allow
          </Button>
        )}
        <Button onClick={handleDenyClick} size="small" variant="error">
          {hasMultiplePeopleWaiting ? 'Deny All' : 'Deny'}
        </Button>
      </CardFooter>
      <style jsx>{`
        :global(.waiting-room-notification) {
          position: absolute;
          right: var(--spacing-sm);
          top: var(--spacing-sm);
          z-index: 999;
          box-shadow: var(--shadow-depth-2);
        }
        :global(.waiting-room-notification .card-footer) {
          display: flex;
          column-gap: var(--spacing-xxs);
        }
      `}</style>
    </Card>
  );
};

export default WaitingRoomNotification;
