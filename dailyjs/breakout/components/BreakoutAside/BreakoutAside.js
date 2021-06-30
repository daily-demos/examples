import {React, useState } from 'react';
import Aside from '@dailyjs/shared/components/Aside';
import { Button } from '@dailyjs/shared/components/Button';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import PropTypes from 'prop-types';
import { useBreakout } from '../../contexts/BreakoutProvider'

export const BREAKOUT_ASIDE = 'breakout';

const ParticipantsRow = ({ participant }) => (
  <div className="person-row">
    <div className="name">
      {participant.name} {participant.isLocal && '(You)'}
    </div>
  </div>
);
ParticipantsRow.propTypes = {
  participant: PropTypes.object,
};

export const BreakoutAside = () => {
  const { showAside, setShowAside } = useUIState();
  const { participantCount, participants } = useParticipants();
  const { previewParticipantsIntoGroups } = useBreakout();


  if (!showAside || showAside !== BREAKOUT_ASIDE) {
    return null;
  }

  function showParticipants(){
    return (participants.filter(p => !p.isOwner).map((p) => (
      <ParticipantsRow participant={p} key={p.id}>{p.name}</ParticipantsRow>
    )))
  }

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
                      size="tiny"
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
            { showParticipants() }
          </div>
        </main>
        <footer className="breakout-footer">
          <Button 
            size="tiny" 
            onClick={() => console.log("todo")}
          >
            Create groups / Gather groups toggle
        </Button>           
        </footer>
      <style jsx>{`
          .breakout-footer {
            padding-top: 10em;
          }
        }
      `}</style>
    </Aside>
  );
};

export default BreakoutAside;
