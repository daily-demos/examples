import React, { useMemo } from 'react';
import Button from '@dailyjs/shared/components/Button';
import HeaderCapsule from '@dailyjs/shared/components/HeaderCapsule';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';

export const Header = () => {
  const { participantCount } = useParticipants();

  return useMemo(
    () => (
      <header className="room-header">
        <img src="assets/daily-logo.svg" alt="Daily" className="logo" />

        <HeaderCapsule variant="button">
          {`${participantCount} ${
            participantCount === 1 ? 'participant' : 'participants'
          }`}
          <Button size="tiny" variant="outline-dark">
            Invite
          </Button>
        </HeaderCapsule>

        <style jsx>{`
          .room-header {
            display: flex;
            flex: 0 0 auto;
            column-gap: var(--spacing-xxs);
            box-sizing: border-box;
            padding: var(--spacing-sm);
            align-items: center;
            width: 100%;
          }

          .logo {
            margin-right: var(--spacing-xs);
          }
        `}</style>
      </header>
    ),
    [participantCount]
  );
};

export default Header;
