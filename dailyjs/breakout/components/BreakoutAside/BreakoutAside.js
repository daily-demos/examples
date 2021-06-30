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
  const { ParticipantsRow, previewParticipantsIntoGroups, showParticipants, showGroupsPreview } = useBreakout();

  if (!showAside || showAside !== BREAKOUT_ASIDE) {
    return null;
  }

  const toggleCreateGatherGroups = () => console.log("todo");

  return (
    <Aside onClose={() => setShowAside(false)}>
      <header className="breakout-header">
        {/* Need at least 5 people in the room for breakouts */}
        {`${
            participantCount > 4 ? 
            `There are ${participantCount} participants` : 
            'Not enough people in room for breakouts'
        }`}
        {/* Increase to 5 when ready */}
        { participantCount > 0 &&
              <div>
                  How many groups?
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
            <strong>Participants:</strong>
            { showGroupsPreview().length ? showGroupsPreview() : showParticipants() }
          </div>
        </main>
        <Button 
          size="tiny" 
          onClick={() => toggleCreateGatherGroups() }
        >
          Create groups
        </Button>
      <style jsx>{`
      `}</style>
    </Aside>
  );
};

export default BreakoutAside;
