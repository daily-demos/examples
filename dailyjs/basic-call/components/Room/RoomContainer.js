import React, { useMemo } from 'react';
import { Audio } from '@dailyjs/shared/components/Audio';
import { BasicTray } from '@dailyjs/shared/components/Tray';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import useJoinSound from '@dailyjs/shared/hooks/useJoinSound';
import PropTypes from 'prop-types';
import WaitingRoom from '../WaitingRoom';

export const RoomContainer = ({ children }) => {
  const { isOwner } = useParticipants();

  useJoinSound();

  const roomComponents = useMemo(
    () => (
      <>
        {/* Show waiting room notification & modal if call owner */}
        {isOwner && <WaitingRoom />}
        {/* Tray buttons */}
        <BasicTray />
        {/* Audio tags */}
        <Audio />
      </>
    ),
    [isOwner]
  );

  return (
    <div className="room">
      {children}
      {roomComponents}

      <style jsx>{`
        .room {
          flex-flow: column nowrap;
          width: 100%;
          height: 100%;
          display: flex;
        }
      `}</style>
    </div>
  );
};

RoomContainer.propTypes = {
  children: PropTypes.node,
};

export default RoomContainer;
