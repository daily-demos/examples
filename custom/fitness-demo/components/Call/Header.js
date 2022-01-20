import React, { useMemo, useCallback } from 'react';
import Button from '@custom/shared/components/Button';
import HeaderCapsule from '@custom/shared/components/HeaderCapsule';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconLock } from '@custom/shared/icons/lock-md.svg';
import { ReactComponent as IconPlay } from '@custom/shared/icons/play-sm.svg';
import { slugify } from '@custom/shared/lib/slugify';
import { useClassState, PRE_CLASS_LOBBY, CLASS_IN_SESSION } from '../../contexts/ClassStateProvider';

export const Header = () => {
  const { roomInfo } = useCallState();
  const { participantCount, localParticipant } = useParticipants();
  const { customCapsule } = useUIState();
  const { classType, setClassType } = useClassState();

  const capsuleLabel = useCallback(() => {
    if (!localParticipant.isOwner) return;
    if (classType === PRE_CLASS_LOBBY)
      return (
        <Button
          IconBefore={IconPlay}
          size="tiny"
          variant="success"
          onClick={setClassType}
        >
          Start Class
        </Button>
      )
    if (classType === CLASS_IN_SESSION)
      return (
        <Button
          size="tiny"
          variant="error-light"
          onClick={setClassType}
        >
          End Class
        </Button>
      )
  }, [classType, localParticipant.isOwner, setClassType]);

  return useMemo(
    () => (
      <header className="room-header">
        <img
          src="/assets/daily-logo.svg"
          alt="Daily"
          className="logo"
          width="80"
          height="32"
        />

        <HeaderCapsule>
          {roomInfo.privacy === 'private' && <IconLock />}
          {slugify.revert(roomInfo.name)}
        </HeaderCapsule>
        <HeaderCapsule>
          {`${participantCount} ${
            participantCount === 1 ? 'participant' : 'participants'
          }`}
        </HeaderCapsule>
        <HeaderCapsule>
          {classType}
          {capsuleLabel()}
        </HeaderCapsule>
        {customCapsule && (
          <HeaderCapsule variant={customCapsule.variant}>
            {customCapsule.variant === 'recording' && <span />}
            {customCapsule.label}
          </HeaderCapsule>
        )}

        <style jsx>{`
          .room-header {
            display: flex;
            flex: 0 0 auto;
            column-gap: var(--spacing-xxs);
            box-sizing: border-box;
            padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-xxs)
              var(--spacing-sm);
            align-items: center;
            width: 100%;
          }

          .logo {
            margin-right: var(--spacing-xs);
          }
        `}</style>
      </header>
    ),
    [roomInfo.privacy, roomInfo.name, participantCount, customCapsule, classType, capsuleLabel]
  );
};

export default Header;
