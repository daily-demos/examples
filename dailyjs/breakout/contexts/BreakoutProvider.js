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
    const [ breakoutPreview, setBreakoutPreview ] = useState([]);
    const [ breakoutGroups, setBreakoutGroups ] = useState();
    const { localParticipant, participants } = useParticipants();

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
        // eslint-disable-next-line no-plusplus
        for (let i = groupNum; i > 0; i--) {
            splitGroups.push(participantsArray.splice(0, Math.ceil(participantsArray.length / i)));
        }
        return setBreakoutPreview(splitGroups);
    }

    function showGroupsPreview() {
        const groupsPreview = [];
        breakoutPreview.forEach((group, index) => (
            (groupsPreview.push(<em>Group { (index+1) }</em>),
            group.forEach(p => (
                groupsPreview.push(<ParticipantsRow participant={p} key={p.id}>{p.name}</ParticipantsRow>)
            )))
        ))
        return groupsPreview
    }

    function setCreateGroups(groups) {
        console.log(`setCreateGroups`);
        setBreakoutGroups(groups)
    }

    function setGatherGroups() {
        setBreakoutGroups()
        console.log(` setGatherGroups`);
        callObject.setSubscribeToTracksAutomatically(true)
    }

    function toggleCreateGatherGroups() {
        if (breakoutGroups) {
            setGatherGroups()
        } else {
            setCreateGroups(breakoutPreview)
        }
    }

    useEffect(() => {
        if (!callObject) {
            return false;
        }

        // This will need to move
        if (breakoutGroups) {
            callObject.setSubscribeToTracksAutomatically(false)
            breakoutGroups.forEach(group => {
                if (group.includes(localParticipant)) {
                    group.forEach(p => (
                        callObject.updateParticipant(p.id, {
                            setSubscribedTracks: true,
                        })
                    ))
                }            
            });
        }

        return () => callObject;
    }, [breakoutGroups, localParticipant, callObject]);
  
    return (
      <BreakoutContext.Provider
        value={{
            previewParticipantsIntoGroups,
            showGroupsPreview,
            showParticipants,
            setCreateGroups,
            setGatherGroups,
            toggleCreateGatherGroups,
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
  