import React from 'react';
import {
  WaitingRoomModal,
  WaitingRoomNotification,
} from '@custom/shared/components/WaitingRoom';
import { useWaitingRoom } from '@custom/shared/contexts/WaitingRoomProvider';

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
