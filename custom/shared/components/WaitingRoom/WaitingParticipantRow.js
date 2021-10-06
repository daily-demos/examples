import React from 'react';
import PropTypes from 'prop-types';
import { useWaitingRoom } from '../../contexts/WaitingRoomProvider';
import Button from '../Button';

export const WaitingParticipantRow = ({ participant }) => {
  const { grantAccess, denyAccess } = useWaitingRoom();

  const handleAllowClick = () => {
    grantAccess(participant.id);
  };
  const handleDenyClick = () => {
    denyAccess(participant.id);
  };

  return (
    <div className="waiting-room-row">
      {participant.name}
      <div className="actions">
        <Button onClick={handleAllowClick} size="small" variant="success">
          Allow
        </Button>
        <Button onClick={handleDenyClick} size="small" variant="warning">
          Deny
        </Button>
      </div>

      <style jsx>{`
        .waiting-room-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--gray-light);
          padding-bottom: var(--spacing-xxs);
          margin-bottom: var(--spacing-xxs);
        }

        .waiting-room-row:last-child {
          border-bottom: 0px;
          padding-bottom: 0px;
          margin-bottom: 0px;
        }

        .actions {
          display: flex;
          gap: var(--spacing-xxs);
        }
      `}</style>
    </div>
  );
};

WaitingParticipantRow.propTypes = {
  participant: PropTypes.object,
};

export default WaitingParticipantRow;
