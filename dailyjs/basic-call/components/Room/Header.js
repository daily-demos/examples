import React, { useMemo } from 'react';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';

export const Header = () => {
  const { participantCount } = useParticipants();
  const { customCapsule } = useUIState();

  return useMemo(
    () => (
      <header className="room-header">
        <img src="images/YARD-2.svg" alt="Yard" className="logo" />
        <div className="capsule">Rebuild Local</div>
        <div className="capsule">
          {`${participantCount} ${
            participantCount > 1 ? 'participants' : 'participant'
          }`}
        </div>
        {customCapsule && (
          <div className={`capsule ${customCapsule.variant}`}>
            {customCapsule.variant === 'recording' && <span />}
            {customCapsule.label}
          </div>
        )}

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
            display: flex;
            align-items: center;
            gap: var(--spacing-xxxs);
            background-color: var(--blue-dark);
            border-radius: var(--radius-sm);
            padding: var(--spacing-xxs) var(--spacing-xs);
            box-sizing: border-box;
            line-height: 1;
            font-weight: var(--weight-medium);
            user-select: none;
          }

          .capsule.recording {
            background: var(--secondary-default);
          }

          .capsule.recording span {
            display: block;
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 12px;
            animation: capsulePulse 2s infinite linear;
          }

          @keyframes capsulePulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.25;
            }
            100% {
              opacity: 1;
            }
          }
        `}</style>
      </header>
    ),
    [participantCount, customCapsule]
  );
};

export default Header;
