import React from 'react';
import { Aside } from '@custom/shared/components/Aside';
import { ReactComponent as IconCamOff } from '@custom/shared/icons/camera-off-sm.svg';
import { ReactComponent as IconCamOn } from '@custom/shared/icons/camera-on-sm.svg';
import { ReactComponent as IconMicOff } from '@custom/shared/icons/mic-off-sm.svg';
import { ReactComponent as IconMicOn } from '@custom/shared/icons/mic-on-sm.svg';
import PropTypes from 'prop-types';
import { useCallState } from '../../contexts/CallProvider';
import { useParticipants } from '../../contexts/ParticipantsProvider';
import { useUIState } from '../../contexts/UIStateProvider';
import Button from '../Button';

export const PEOPLE_ASIDE = 'people';

const PersonRow = ({ participant, isOwner = false }) => (
  <div className="person-row">
    <div className="name">
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
            size="tiny-square"
            disabled={participant.isCamMuted}
            variant={participant.isCamMuted ? 'error-light' : 'success-light'}
          >
            {participant.isCamMuted ? <IconCamOff /> : <IconCamOn />}
          </Button>
          <Button
            size="tiny-square"
            disabled={participant.isMicMuted}
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
        padding-bottom: var(--spacing-xxxs);
        margin-bottom: var(--spacing-xxxs);
        justify-content: space-between;
        align-items: center;
        flex: 1;
      }

      .person-row .name {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .person-row .actions {
        display: flex;
        gap: var(--spacing-xxxs);
        margin-left: var(--spacing-xs);
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
  const { showAside, setShowAside } = useUIState();
  const { participants, isOwner } = useParticipants();

  if (!showAside || showAside !== PEOPLE_ASIDE) {
    return null;
  }

  return (
    <Aside onClose={() => setShowAside(false)}>
      <div className="people-aside">
        {isOwner && (
          <div className="owner-actions">
            <Button
              fullWidth
              size="tiny"
              variant="outline-gray"
              onClick={() =>
                callObject.updateParticipants({ '*': { setAudio: false } })
              }
            >
              Mute all mics
            </Button>
            <Button
              fullWidth
              size="tiny"
              variant="outline-gray"
              onClick={() =>
                callObject.updateParticipants({ '*': { setVideo: false } })
              }
            >
              Mute all cams
            </Button>
          </div>
        )}
        <div className="rows">
          {participants.map((p) => (
            <PersonRow participant={p} key={p.id} isOwner={isOwner} />
          ))}
        </div>
        <style jsx>
          {`
            .people-aside {
              display: block;
            }

            .owner-actions {
              display: flex;
              align-items: center;
              gap: var(--spacing-xxxs);
              margin: var(--spacing-xs) var(--spacing-xxs);
              flex: 1;
            }

            .rows {
              margin: var(--spacing-xxs);
              flex: 1;
            }
          `}
        </style>
      </div>
    </Aside>
  );
};

export default PeopleAside;
