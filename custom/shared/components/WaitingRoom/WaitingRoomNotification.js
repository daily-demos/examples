import React, { useEffect, useState } from 'react';

import { useCallState } from '../../contexts/CallProvider';
import { useWaitingRoom } from '../../contexts/WaitingRoomProvider';
import { ReactComponent as IconWaiting } from '../../icons/add-person-lg.svg';
import Button from '../Button';
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

  return (
    <Card className="waiting-room-notification">
      <aside>
        <IconWaiting />
      </aside>
      <CardBody>
        <strong>
          {hasMultiplePeopleWaiting
            ? waitingParticipants.length
            : waitingParticipants[0].name}
        </strong>
        {hasMultiplePeopleWaiting
          ? ` people would like to join the call`
          : ` would like to join the call`}
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
          <Button onClick={handleDenyClick} size="small" variant="warning">
            {hasMultiplePeopleWaiting ? 'Deny All' : 'Deny'}
          </Button>
        </CardFooter>
      </CardBody>
      <style jsx>{`
        :global(.card.waiting-room-notification) {
          position: absolute;
          right: var(--spacing-sm);
          top: var(--spacing-sm);
          z-index: 999;
          padding: 0px;
          display: grid;
          align-items: center;
          grid-template-columns: auto auto;
          overflow: hidden;
          box-shadow: var(--shadow-depth-2);
        }

        strong {
          color: var(--text-default);
        }
        aside {
          background: var(--gray-wash);
          display: flex;
          padding: var(--spacing-md);
          height: 100%;
          align-items: center;
          color: var(--gray-default);
        }

        :global(.waiting-room-notification .card-footer) {
          display: flex;
          column-gap: var(--spacing-xxs);
          margin-top: var(--spacing-xs);
        }

        :global(.waiting-room-notification .card-body) {
          padding: var(--spacing-md);
        }
      `}</style>
    </Card>
  );
};

export default WaitingRoomNotification;
