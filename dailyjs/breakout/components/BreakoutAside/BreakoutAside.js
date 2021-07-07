import { React } from 'react';
import Aside from '@dailyjs/shared/components/Aside';
import { Button } from '@dailyjs/shared/components/Button';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import { useBreakout } from '../../contexts/BreakoutProvider'

export const BREAKOUT_ASIDE = 'breakout';

export const BreakoutAside = () => {
  const { showAside, setShowAside } = useUIState();
  const { participantCount, participants } = useParticipants();
  const { previewParticipantsIntoGroups, showParticipants, showGroupsPreview, toggleCreateGatherGroups } = useBreakout();

  if (!showAside || showAside !== BREAKOUT_ASIDE) {
    return null;
  }

  return (
    <Aside onClose={() => setShowAside(false)}>
      <header className="breakout-header">
        {`${
            participantCount > 4 ? 
            `There are ${participantCount} participants` : 
            'Not enough people in room for breakouts'
        }`}
        {/* Increase to 5 when ready */}
        { participantCount > 0 &&
              <div>
                  <input
                      id="breakoutRoomsNumber"
                      type="number"
                      min="1"
                      max="10"
                  />
                  <Button 
                      size="tiny" 
                      variant="outline-gray" 
                      onClick={() => previewParticipantsIntoGroups(participants.filter(p => !p.isOwner))}
                  >
                      Preview groups
                  </Button>
              </div>
          }
        </header>
        <main className="rows">
          <div>
            <strong>Instructor(s):</strong>
            { participants.filter(p => p.isOwner).map((p) => (
              <ParticipantsRow participant={p} key={p.id}>{p.name}</ParticipantsRow>
              ))
            }
            <br/>
            <strong>Participants:</strong>
            <br/>
            { showGroupsPreview().length > 0 ? showGroupsPreview() : showParticipants() }
          </div>
        </main>
        { showGroupsPreview().length > 0 && 
          <Button 
            size="tiny" 
            onClick={() => toggleCreateGatherGroups() }
          >
          Create / Gather groups
          </Button>
        }
      <style jsx>{`
        #breakoutRoomsNumber {
          width: 4em;
          float: left;
          margin-right: 1em;
          margin-left: 0.5em;
          font-size: 18px;
          padding: 0.2em;
          border: 1px solid var(--gray-light);
          border-radius: var(--radius-xs);
        }
      `}</style>
    </Aside>
  );
};

export default BreakoutAside;
