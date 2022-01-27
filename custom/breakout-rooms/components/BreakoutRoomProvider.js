import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { uuid } from '@supabase/supabase-js/dist/main/lib/helpers';
import PropTypes from 'prop-types';
import { groupBy } from '../utils/groupBy';
import { supabase } from '../utils/supabase';

export const BreakoutRoomContext = createContext();

export const BreakoutRoomProvider = ({ children }) => {
  const { callObject, roomInfo } = useCallState();
  const { participants, localParticipant } = useParticipants();
  const { setCustomCapsule } = useUIState();

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [subParticipants, setSubParticipants] = useState([]);
  const [breakoutRooms, setBreakoutRooms] = useState({});

  // to get the breakout room participants data
  const getBreakoutRoomsData = useCallback(async () => {
    let roomData = { room: {}, breakoutRooms: {} };

    const { data } = await supabase
      .from('breakout')
      .select('*')
      .eq('name', roomInfo?.name);

    roomData.room = data.slice(-1).pop();
    if (roomData.room) {
      const { data: participantsData } = await supabase
        .from('participants')
        .select('*')
        .eq('room_id', roomData.room.id);

      roomData.breakoutRooms = groupBy(participantsData, 'session_id');
    }
    return roomData;
  }, [roomInfo?.name]);

  const handleTrackSubscriptions = useCallback(async () => {
    const breakoutRoomsData = await getBreakoutRoomsData();
    setIsSessionActive(breakoutRoomsData.room.is_active);

    if (breakoutRoomsData.room.is_active) {
      setBreakoutRooms(breakoutRoomsData.breakoutRooms);
      // set capsule on the header.
      setCustomCapsule({ variant: 'recording', label: 'Breakout Rooms' });

      Object.values(breakoutRoomsData.breakoutRooms || []).map(room => {
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
    }
  }, [callObject, getBreakoutRoomsData, localParticipant.user_id, setCustomCapsule]);

  const handleEndBreakoutRooms = useCallback(() => {
    if (!callObject) return;

    setIsSessionActive(false);
    setCustomCapsule();
    callObject.setSubscribeToTracksAutomatically(true);
  }, [callObject, setCustomCapsule]);

  const handleAppMessage = useCallback((e) => {
    if (e?.data?.message?.type === 'breakout-rooms') handleTrackSubscriptions();
    if (e?.data?.message?.type === 'end-breakout-rooms') handleEndBreakoutRooms();
  }, [handleEndBreakoutRooms, handleTrackSubscriptions]);

  const handleJoinedMeeting = useCallback(async () => {
    const roomsData = await getBreakoutRoomsData();

    if (roomsData.room) {
      setIsSessionActive(roomsData.room.is_active);
      if (roomsData.room.is_active) {
        const { data: participantsData } = await supabase
          .from('participants')
          .select('*')
          .eq('room_id', roomsData.room.id);

        // checking if rooms are full, if not adding the user to the last room.
        if (Math.ceil(participantsData.length/roomsData.room.max_size) > participantsData.length/roomsData.room.max_size) {
          await supabase
            .from('participants')
            .insert([
              {
                participant_id: localParticipant.user_id,
                session_id: participantsData.slice(-1).pop().session_id,
                room_id: roomsData.room.id
              }
            ]);
        } else {
          await supabase
            .from('participants')
            .insert([{
              participant_id: localParticipant.user_id,
              session_id: uuid(),
              room_id: roomsData.room.id
            }]);
        }
        handleTrackSubscriptions();
      }
    }
  }, [getBreakoutRoomsData, handleTrackSubscriptions, localParticipant.user_id]);

  useEffect(() => {
    if (!callObject) return;

    callObject.on('joined-meeting', handleJoinedMeeting);
    callObject.on('app-message', handleAppMessage);
    callObject.on('participant-joined', handleTrackSubscriptions);
    return () => {
      callObject.off('joined-meeting', handleJoinedMeeting);
      callObject.off('app-message', handleAppMessage);
      callObject.off('participant-joined', handleTrackSubscriptions);
    }
  }, [callObject, handleAppMessage, handleTrackSubscriptions, handleJoinedMeeting]);

  const createSession = async (maxParticipants) => {
    setIsSessionActive(true);

    // inserting the room status into supabase.
    const { data: roomData } = await supabase
      .from('breakout')
      .insert([{ name: roomInfo.name, max_size: maxParticipants }]);

    const rooms = [];
    new Array(Math.ceil(participants.length / maxParticipants))
      .fill()
      .map(_ => rooms.push({ session_id: uuid(), members: participants.splice(0, maxParticipants)}));

    const participantsList = [];
    rooms.map(r =>
      r.members.map(p =>
        participantsList.push({ participant_id: p.user_id, session_id: r.session_id, room_id: roomData[0].id })));

    await supabase
      .from('participants')
      .insert(participantsList);

    // sending the breakout-rooms event to other users.
    callObject.sendAppMessage({ message: { type: 'breakout-rooms' }}, '*');
    handleTrackSubscriptions();
  };

  const endSession = async () => {
    setIsSessionActive(false);

    const { data } = await supabase
      .from('breakout')
      .select('*')
      .eq('name', roomInfo?.name);

    const room = data.slice(-1).pop();
    if (room.is_active) {
      await supabase
        .from('breakout')
        .update({ is_active: false })
        .match({ id: room.id });
    }

    handleEndBreakoutRooms();
    callObject.sendAppMessage({ message: { type: 'end-breakout-rooms' }}, '*');
  };

  return (
    <BreakoutRoomContext.Provider
      value={{
        isActive: isSessionActive,
        breakoutRooms,
        subscribedParticipants: subParticipants,
        createSession,
        endSession,
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