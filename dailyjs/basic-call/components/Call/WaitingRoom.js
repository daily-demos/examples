import React from 'react';
import {
  WaitingRoomModal,
  WaitingRoomNotification,
} from '@dailyjs/shared/components/WaitingRoom';
import { useWaitingRoom } from '@dailyjs/shared/contexts/WaitingRoomProvider';

export const WaitingRoom = () => {
  const { setShowModal, showModal } = useWaitingRoom();
  return (
    <>
      <WaitingRoomNotification />
      {showModal && <WaitingRoomModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default WaitingRoom;
