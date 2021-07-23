import React, { useRef } from 'react';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import SpeakerTile from './SpeakerTile';

export const SpeakerView = () => {
  const { currentSpeaker } = useParticipants();
  const activeRef = useRef();

  return (
    <div ref={activeRef} className="active">
      <SpeakerTile participant={currentSpeaker} screenRef={activeRef} />
      <style jsx>{`
        .active {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default SpeakerView;
