import React from 'react';
import Aside from '@dailyjs/shared/components/Aside';
import { ReactComponent as IconCamOff } from '@dailyjs/shared/icons/camera-off-sm.svg';
import { ReactComponent as IconCamOn } from '@dailyjs/shared/icons/camera-on-sm.svg';
import { ReactComponent as IconMicOff } from '@dailyjs/shared/icons/mic-off-sm.svg';
import { ReactComponent as IconMicOn } from '@dailyjs/shared/icons/mic-on-sm.svg';
import PropTypes from 'prop-types';
import { useCallState } from '../../contexts/CallProvider';
import { useParticipants } from '../../contexts/ParticipantsProvider';
import { useUIState } from '../../contexts/UIStateProvider';
import { Button } from '../Button';

const PersonRow = ({ participant, isOwner = false }) => (
  <div className="person-row">
    <div>
      {participant.name} {participant.isLocal && '(You)'}
    </div>
    <div className="actions">
      {!isOwner ? (
        <>
          <span
            className={participant.isCamMuted ? 'state error' : 'state success'}
          >
            {participant.isCamMuted ? <IconCamOff /> : <IconCamOn />}
          </span>
          <span
            className={participant.isMicMuted ? 'state error' : 'state success'}
          >
            {participant.isMicMuted ? <IconMicOff /> : <IconMicOn />}
          </span>
        </>
      ) : (
        <>
          <Button
            size="medium-square"
            variant={participant.isCamMuted ? 'error-light' : 'success-light'}
          >
            {participant.isCamMuted ? <IconCamOff /> : <IconCamOn />}
          </Button>
          <Button
            size="medium-square"
            variant={participant.isMicMuted ? 'error-light' : 'success-light'}
          >
            {participant.isMicMuted ? <IconMicOff /> : <IconMicOn />}
          </Button>
        </>
      )}
    </div>
    <style jsx>{`
      .person-row {
        display: flex;
        border-bottom: 1px solid var(--gray-light);
        padding: var(--spacing-xs) 0;
        justify-content: space-between;
        align-items: center;
        margin: 0 var(--spacing-xs);
      }

      .person-row .actions {
        display: flex;
        gap: var(--spacing-xxs);
      }

      .mute-state {
        display: flex;
        width: 24px;
        height: 24px;
        align-items: center;
        justify-content: center;
      }

      .state.error {
        color: var(--red-default);
      }
      .state.success {
        color: var(--green-default);
      }
    `}</style>
  </div>
);
PersonRow.propTypes = {
  participant: PropTypes.object,
  isOwner: PropTypes.bool,
};

export const PeopleAside = () => {
  const { callObject } = useCallState();
  const { showPeopleAside } = useUIState();
  const { allParticipants, isOwner } = useParticipants();

  if (!showPeopleAside) {
    return null;
  }

  return (
    <Aside>
      {isOwner && (
        <>
          <Button
            onClick={() =>
              callObject.updateParticipants({ '*': { setAudio: false } })
            }
          >
            Mute all mics
          </Button>
          <Button
            onClick={() =>
              callObject.updateParticipants({ '*': { setVideo: false } })
            }
          >
            Mute all cam
          </Button>
        </>
      )}
      {allParticipants.map((p) => (
        <PersonRow participant={p} key={p.id} isOwner={isOwner} />
      ))}
    </Aside>
  );
};

export default PeopleAside;
