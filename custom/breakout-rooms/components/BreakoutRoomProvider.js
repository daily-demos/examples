import React, {
  createContext,
  useCallback,
  useContext,
  useEffect, useMemo,
  useState
} from 'react';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { uuid } from '@supabase/supabase-js/dist/main/lib/helpers';
import PropTypes from 'prop-types';
import {
  createBreakoutRoom,
  createBreakoutRoomParticipants, endBreakoutRoom, getBreakoutRoom,
  getBreakoutRoomsData,
  getRoomParticipantsByRoomId,
} from '../utils/lib';

export const BreakoutRoomContext = createContext();

export const BreakoutRoomProvider = ({ children }) => {
  const { callObject, roomInfo } = useCallState();
  const { participants, localParticipant } = useParticipants();
  const { setCustomCapsule } = useUIState();

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [subParticipants, setSubParticipants] = useState([]);
  const [breakoutRooms, setBreakoutRooms] = useState({});

  const handleUserTrackSubscriptions = useCallback(async () => {
    const { room, breakoutRooms } = await getBreakoutRoomsData(roomInfo?.name);
    setIsSessionActive(room.is_active);

    if (room.is_active) {
      callObject.setSubscribeToTracksAutomatically(false);
      setBreakoutRooms(breakoutRooms);
      // set capsule on the header.
      setCustomCapsule({ variant: 'recording', label: 'Breakout Rooms' });

      Object.values(breakoutRooms || []).forEach(participants => {
        const updateList = [];
        const isLocalUserInRoom = participants.find(p => p.participant_id === localParticipant.user_id);
        if (isLocalUserInRoom) {
          const participantsIDs = [];
          participants.map(p => {
            participantsIDs.push(p.participant_id);
            if (p.participant_id !== localParticipant.user_id)
              updateList[p.participant_id] = { setSubscribedTracks: true }
          });
          setSubParticipants(participantsIDs);
          callObject.updateParticipants(updateList);
          return;
        }
      })
    }
  }, [callObject, localParticipant.user_id, roomInfo?.name, setCustomCapsule]);

  const handleEndBreakoutRooms = useCallback(() => {
    if (!callObject) return;

    setIsSessionActive(false);
    setCustomCapsule();
    callObject.setSubscribeToTracksAutomatically(true);
  }, [callObject, setCustomCapsule]);

  const handleAppMessage = useCallback((e) => {
    if (e?.data?.message?.type === 'breakout-rooms') handleUserTrackSubscriptions();
    if (e?.data?.message?.type === 'end-breakout-rooms') handleEndBreakoutRooms();
  }, [handleEndBreakoutRooms, handleUserTrackSubscriptions]);

  const handleJoinedMeeting = useCallback(async () => {
    const roomsData = await getBreakoutRoomsData(roomInfo?.name);

    if (roomsData.room) {
      setIsSessionActive(roomsData.room.is_active);
      if (roomsData.room.is_active) {
        const { data: participantsData } = await getRoomParticipantsByRoomId(roomsData.room.id);

        // checking if rooms are full, if not adding the user to the last room.
        let participant;
        const size = participantsData.length/roomsData.room.max_size;
        if (Math.ceil(size) > size) {
          participant = {
            participant_id: localParticipant.user_id,
            session_id: participantsData.slice(-1).pop().session_id,
            room_id: roomsData.room.id
          };
        } else {
          participant = {
            participant_id: localParticipant.user_id,
            session_id: participantsData.slice(-1).pop().session_id,
            room_id: roomsData.room.id
          };
        }
        await createBreakoutRoomParticipants(participant);
        await handleUserTrackSubscriptions();
      }
    }
  }, [
    handleUserTrackSubscriptions,
    localParticipant.user_id,
    roomInfo?.name
  ]);

  useEffect(() => {
    if (!callObject) return;

    callObject.on('joined-meeting', handleJoinedMeeting);
    callObject.on('app-message', handleAppMessage);
    callObject.on('participant-joined', handleUserTrackSubscriptions);
    return () => {
      callObject.off('joined-meeting', handleJoinedMeeting);
      callObject.off('app-message', handleAppMessage);
      callObject.off('participant-joined', handleUserTrackSubscriptions);
    }
  }, [
    callObject,
    handleAppMessage,
    handleUserTrackSubscriptions,
    handleJoinedMeeting
  ]);

  const roomParticipants = useMemo(() => {
    if (!isSessionActive) return participants
    return participants.filter(p => subParticipants.includes(p.user_id));
  }, [isSessionActive, participants, subParticipants]);

  const participantCount = useMemo(() => roomParticipants.length, [roomParticipants]);

  const createSession = async (maxParticipants) => {
    const participantsList = [];

    setIsSessionActive(true);
    const { data: roomData } = await createBreakoutRoom(roomInfo?.name, maxParticipants);

    let rooms = [...new Array(Math.ceil(participants.length / maxParticipants))]
      .map(() => ({ session_id: uuid(), members: participants.slice(0, maxParticipants)}));

    rooms.map(r =>
      r.members.map(p =>
        participantsList.push({ participant_id: p.user_id, session_id: r.session_id, room_id: roomData[0].id })));

    await createBreakoutRoomParticipants(participantsList);

    // sending the breakout-rooms event to other users.
    callObject.sendAppMessage({ message: { type: 'breakout-rooms' }}, '*');
    await handleUserTrackSubscriptions();
  };

  const endSession = async () => {
    setIsSessionActive(false);

    const { data: room } = await getBreakoutRoom(roomInfo?.name);
    if (room.is_active) {
      await endBreakoutRoom(room.id);
      callObject.sendAppMessage({ message: { type: 'end-breakout-rooms' }}, '*');
      handleEndBreakoutRooms();
    }
  };

  return (
    <BreakoutRoomContext.Provider
      value={{
        isActive: isSessionActive,
        breakoutRooms,
        participants: roomParticipants,
        participantCount,
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