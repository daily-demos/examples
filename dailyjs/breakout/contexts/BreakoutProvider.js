import React, {
    createContext,
    useContext,
    useEffect,
    useState,
  } from 'react';
  import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
  import PropTypes from 'prop-types';
  
  export const BreakoutContext = createContext();
  
  export const BreakoutProvider = ({ children }) => {
    const { callObject } = useCallState();
    const [participantGroups, setParticipantGroups] = useState([]);

    function previewParticipantsIntoGroups(participantsArray) {
        const groupNum = document.getElementById("breakoutRoomsNumber").value || 1
        // Split participants into user-specified number of groups
        const splitGroups = [];
        // eslint-disable-next-line no-plusplus
        for (let i = groupNum; i > 0; i--) {
            splitGroups.push(participantsArray.splice(0, Math.ceil(participantsArray.length / i)));
        }
        setParticipantGroups(splitGroups);
        console.log(participantGroups)
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
            previewParticipantsIntoGroups
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
  