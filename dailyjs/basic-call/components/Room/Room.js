import React from 'react';
import { Audio } from '@dailyjs/shared/components/Audio';
import { BasicTray } from '@dailyjs/shared/components/Tray';
import {
  WaitingRoomModal,
  WaitingRoomNotification,
} from '@dailyjs/shared/components/WaitingRoom';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import { useWaitingRoom } from '@dailyjs/shared/contexts/WaitingRoomProvider';
import useJoinSound from '@dailyjs/shared/hooks/useJoinSound';

import PropTypes from 'prop-types';
import { VideoGrid } from '../VideoGrid';
import { Header } from './Header';

export const Room = ({ MainComponent = VideoGrid }) => {
  const { setShowModal, showModal } = useWaitingRoom();
  const { localParticipant } = useParticipants();

  useJoinSound();

  return (
    <div className="room">
      <Header />

      <main>
        <MainComponent />
      </main>

      {/* Show waiting room notification & modal if call owner */}
      {localParticipant?.isOwner && (
        <>
          <WaitingRoomNotification />
          {showModal && (
            <WaitingRoomModal onClose={() => setShowModal(false)} />
          )}
        </>
      )}

      <BasicTray />
      <Audio />

      <style jsx>{`
        .room {
          flex-flow: column nowrap;
          width: 100%;
          height: 100%;
          display: flex;
        }

        main {
          flex: 1 1 auto;
          position: relative;
          overflow: hidden;
          min-height: 0px;
          height: 100%;
          padding: var(--spacing-xxxs);
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

Room.propTypes = {
  MainComponent: PropTypes.func,
};

export default Room;
