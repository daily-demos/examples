import { groupBy } from './groupBy';
import { supabase } from './supabase';

export const getBreakoutRoom = async (name) => {
  const { data, error } = await supabase
    .from('breakout')
    .select('*')
    .eq('name', name);

  return { data: data.slice(-1).pop(), error };
};

export const getRoomParticipantsByRoomId = async (id) => {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('room_id', id);

  return { data, error };
};

export const getBreakoutRoomsData = async (name) => {
  let roomData = { room: {}, breakoutRooms: {} };
  const { data } = await getBreakoutRoom(name);
  roomData.room = data;

  if (roomData.room) {
    const { data: participantsData } = await getRoomParticipantsByRoomId(roomData.room.id);
    roomData.breakoutRooms = groupBy(participantsData, 'session_id');
  }
  return roomData;
};

export const createBreakoutRoom = async (name, maxParticipants) => {
  const { data, error } = await supabase
    .from('breakout')
    .insert([{ name: name, max_size: maxParticipants }]);

  return { data, error };
};

export const createBreakoutRoomParticipants = async (participants) => {
  const { data, error } = await supabase
    .from('participants')
    .insert(Array.isArray(participants) ? participants: [participants]);

  return { data, error };
};

export const endBreakoutRoom = async (id) => {
  const { data, error } = await supabase
    .from('breakout')
    .update({ is_active: false })
    .match({ id: id });

  return { data, error };
};