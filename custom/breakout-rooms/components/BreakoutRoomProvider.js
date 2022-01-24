import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { uuid } from '@supabase/supabase-js/dist/main/lib/helpers';
import PropTypes from 'prop-types';
import { groupBy } from '../utils/groupBy';
import { supabase } from '../utils/supabase';

export const BreakoutRoomContext = createContext();

export const BreakoutRoomProvider = ({ children }) => {
  const { callObject } = useCallState();
  const { participants, localParticipant } = useParticipants();

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [subParticipants, setSubParticipants] = useState([]);
  const [breakoutRooms, setBreakoutRooms] = useState([]);

  const handleTrackSubscriptions = useCallback((breakoutRooms) => {
    Object.values(breakoutRooms || []).map(room => {
      const updateList = [];
      const isLocalUserInRoom =
        room.filter(r => r.participant_id === localParticipant.user_id).length > 0;
      if (isLocalUserInRoom) {
        const participantsIDs = [];
        callObject.setSubscribeToTracksAutomatically(false);
        room.map(p => {
          participantsIDs.push(p.participant_id);
          if (p.participant_id !== localParticipant.user_id)
            updateList[p.participant_id] = { setSubscribedTracks: true }
        });
        setSubParticipants(participantsIDs);
        callObject.updateParticipants(updateList);
      }
    })
  }, [callObject, localParticipant.user_id]);

  const handleAppMessage = useCallback((e) => {
    if (e?.data?.message?.type === 'breakout-rooms') {
      setIsSessionActive(true);
      handleTrackSubscriptions(e?.data?.message?.value);
    }
  }, [handleTrackSubscriptions]);

  useEffect(() => {
    if (!callObject) return;

    callObject.on('app-message', handleAppMessage);
    return () => callObject.off('app-message', handleAppMessage);
  }, [callObject, handleAppMessage]);

  const createSession = async (maxParticipants) => {
    setIsSessionActive(true);

    const rooms = [];
    new Array(Math.ceil(participants.length / maxParticipants))
      .fill()
      .map(_ => rooms.push({ session_id: uuid(), members: participants.splice(0, maxParticipants)}));

    const participantsList = [];
    rooms.map(r =>
      r.members.map(p => participantsList.push({ participant_id: p.user_id, session_id: r.session_id })));

    const { data } = await supabase
      .from('participants')
      .insert(participantsList);

    const groupedByData = groupBy(data, 'session_id');

    callObject.sendAppMessage({
      message: {
        type: 'breakout-rooms',
        value: groupedByData,
      }
    }, '*');

    handleTrackSubscriptions(groupedByData);
    setBreakoutRooms(groupedByData);
  };

  return (
    <BreakoutRoomContext.Provider
      value={{
        isActive: isSessionActive,
        breakoutRooms,
        subscribedParticipants: subParticipants,
        createSession,
      }}
    >
      {children}
    </BreakoutRoomContext.Provider>
  );
};

BreakoutRoomProvider.propTypes = {
  children: PropTypes.node,
};

export const useBreakoutRoom = () => useContext(BreakoutRoomContext);