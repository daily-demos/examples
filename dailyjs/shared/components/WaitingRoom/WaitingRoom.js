import React, { useEffect } from 'react';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';

export const WaitingRoom = () => {
  const { callObject } = useCallState();

  /**
   * Show notification when waiting participants change.
   */
  useEffect(() => {
    const handleWaitingParticipantAdded = () => {
      console.log('people are waiting');
      // setShowNotification(Object.keys(daily.waitingParticipants()).length > 0);
    };

    callObject.on('waiting-participant-added', handleWaitingParticipantAdded);
    return () => {
      callObject.off(
        'waiting-participant-added',
        handleWaitingParticipantAdded
      );
    };
  }, [callObject]);

  return <div>Waiting Room</div>;
};

export default WaitingRoom;
