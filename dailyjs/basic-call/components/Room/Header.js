import React, { useMemo } from 'react';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';

export const Header = () => {
  const { participantCount } = useParticipants();

  return useMemo(
    () => (
      <header className="room-header">
        <img src="images/daily-logo.svg" alt="Daily" className="logo" />
        <div className="capsule">Basic call demo</div>
        <div className="capsule">
          {`${participantCount} ${
            participantCount > 1 ? 'participants' : 'participant'
          }`}
        </div>

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

          .capsule {
            background-color: var(--blue-dark);
            border-radius: var(--radius-sm);
            padding: var(--spacing-xxs) var(--spacing-xs);
            box-sizing: border-box;
            line-height: 1;
            font-weight: var(--weight-medium);
            user-select: none;
          }
        `}</style>
      </header>
    ),
    [participantCount]
  );
};

export default Header;
