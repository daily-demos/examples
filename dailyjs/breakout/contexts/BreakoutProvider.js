import React, {
    createContext,
    useContext,
    useEffect,
    useState,
  } from 'react';
  import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
  import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
  import PropTypes from 'prop-types';

  export const BreakoutContext = createContext();
  
  export const BreakoutProvider = ({ children }) => {
    const { callObject } = useCallState();
    const [participantGroups, setParticipantGroups] = useState([]);
    const { participants } = useParticipants();

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
      
    function showParticipants(){
        return (participants.filter(p => !p.isOwner).map((p) => (
          <ParticipantsRow participant={p} key={p.id}>{p.name}</ParticipantsRow>
        )))
      }
    
      function previewParticipantsIntoGroups(participantsArray) {
        const groupNum = document.getElementById("breakoutRoomsNumber").value || 1
        const splitGroups = [];
        for (let i = groupNum; i > 0; i--) {
            splitGroups.push(participantsArray.splice(0, Math.ceil(participantsArray.length / i)));
        }
        return setParticipantGroups(splitGroups);
      }
    
      function showGroupsPreview() {
        const groupsPreview = [];
        participantGroups.forEach((group, index) => (
          groupsPreview.push(<em>Group { (index+1) }</em>),
          group.forEach(p => (
            groupsPreview.push(<ParticipantsRow participant={p} key={p.id}>{p.name}</ParticipantsRow>)
          ))
        ))
        return groupsPreview
      }

    useEffect(() => {
      if (!callObject) {
        return false;
      }
  
      return () => callObject;
    }, [callObject]);
  
    return (
      <BreakoutContext.Provider
        value={{
            ParticipantsRow,
            previewParticipantsIntoGroups,
            showGroupsPreview,
            showParticipants
        }}
      >
        {children}
      </BreakoutContext.Provider>
    );
  };
  
  BreakoutProvider.propTypes = {
    children: PropTypes.node,
  };
  
  export const useBreakout = () => useContext(BreakoutContext);
  