import React, { useState } from 'react';
import Button from '@custom/shared/components/Button';
import { CardBody } from '@custom/shared/components/Card';
import Field from '@custom/shared/components/Field';
import { TextInput } from '@custom/shared/components/Input';
import Modal from '@custom/shared/components/Modal';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { useBreakoutRoom } from './BreakoutRoomProvider';

export const BREAKOUT_ROOM_MODAL = 'breakout-room';

export const BreakoutRoomModal = () => {
  const { currentModals, closeModal } = useUIState();
  const { participants } = useParticipants();
  const [maxSize, setMaxSize] = useState(2);
  const { createSession } = useBreakoutRoom();

  const getRoomStatus = () => {
    if (!maxSize) return;
    if (participants.length < 4) return <p>Cannot create breakout rooms with less than 4 members in the call.</p>;
    if (maxSize >= participants.length) return <p>Max size should be less than total participants.</p>
    return (
      <p>
        We have a total of {participants.length} participants in the call,
        we will create <b>{Math.ceil(participants.length/maxSize)} rooms</b> with <b>{maxSize} participants</b> per room.
      </p>
    )
  }

  const create = () => {
    createSession(maxSize);
    closeModal(BREAKOUT_ROOM_MODAL);
  };

  return (
    <Modal
      title="Breakout Rooms"
      isOpen={currentModals[BREAKOUT_ROOM_MODAL]}
      onClose={() => closeModal(BREAKOUT_ROOM_MODAL)}
      actions={[
        <Button key="close" fullWidth variant="outline">
          Close
        </Button>,
        <Button
          key="submit"
          fullWidth
          disabled={participants.length < 4 || maxSize >= participants.length}
          onClick={create}>
          Create rooms
        </Button>
      ]}
    >
      <CardBody>
        {getRoomStatus()}
        <Field label="Enter max size of a room">
          <TextInput
            placeholder="Max Size"
            required
            value={maxSize}
            onChange={(e) => setMaxSize(e.target.value)}
          />
        </Field>
      </CardBody>
    </Modal>
  );
};

export default BreakoutRoomModal;
