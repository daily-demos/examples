import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCallState } from '../contexts/CallProvider';

// @params initialValues - initial values of the shared state.
// @params broadcast - share the state with the other participants whenever the state changes.
export const useSharedState = ({ initialValues = {}, broadcast = true }) => {
  const { callObject } = useCallState();
  const stateRef = useRef(null);
  const requestIntervalRef = useRef(null);

  const [state, setState] = useState({
    sharedState: initialValues,
    setAt: undefined,
  });

  // handling the app-message event, to check if the state is being shared.
  const handleAppMessage = useCallback(
    event => {
      // two types of events -
      // 1. Request shared state (request-shared-state)
      // 2. Set shared state (set-shared-state)
      switch (event.data?.message?.type) {
        // if we receive a request-shared-state message type, we check if the user has any previous state,
        // if yes, we will send the shared-state to everyone in the call.
        case 'request-shared-state':
          if (!stateRef.current.setAt) return;
          callObject.sendAppMessage(
            {
              message: {
                type: 'set-shared-state',
                value: stateRef.current,
              },
            },
            '*',
          );
          break;
        // if we receive a set-shared-state message type then, we check the state timestamp with the local one and
        // we set the latest shared-state values into the local state.
        case 'set-shared-state':
          clearInterval(requestIntervalRef.current);
          if (
            stateRef.current.setAt &&
            new Date(stateRef.current.setAt) > new Date(event.data.message.value.setAt)
          )
            return;
          setState(event.data.message.value);
          break;
      }
    },
    [stateRef, callObject],
  );

  // whenever local user joins, we randomly pick a participant from the call and request him for the state.
  const handleJoinedMeeting = useCallback(() => {
    const randomDelay = 1000 + Math.ceil(1000 * Math.random());

    requestIntervalRef.current = setInterval(() => {
      const callObjectParticipants = callObject.participants();
      const participants = Object.values(callObjectParticipants);
      const localParticipant = callObjectParticipants.local;

      if (participants.length > 1) {
        const remoteParticipants = participants.filter((p) =>
          !p.local && new Date(p.joined_at) < new Date(localParticipant.joined_at)
        );
        const randomPeer = remoteParticipants[Math.floor(Math.random() * remoteParticipants.length)];
        callObject.sendAppMessage(
          {
            message: {
              type: 'request-shared-state',
            },
          },
          randomPeer.user_id,
        );
      } else clearInterval(requestIntervalRef.current);
    }, randomDelay);

    return () => clearInterval(requestIntervalRef.current);
  }, [callObject]);

  useEffect(() => {
    if (!callObject) return;
    callObject.on('app-message', handleAppMessage);
    callObject.on('joined-meeting', handleJoinedMeeting);
    return () => {
      callObject.off('app-message', handleAppMessage);
      callObject.off('joined-meeting', handleJoinedMeeting);
    }
  }, [callObject, handleAppMessage, handleJoinedMeeting]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // setSharedState function takes in the state values :-
  // 1. shares the state with everyone in the call.
  // 2. set the state for the local user.
  const setSharedState = useCallback(
    values => {
      setState((state) => {
        const currentValues = typeof values === 'function' ? values(state.sharedState) : values;
        const stateObj = { ...state, sharedState: currentValues, setAt: new Date() };
        // if broadcast is true, we send the state to everyone in the call whenever the state changes.
        if (broadcast) {
          callObject.sendAppMessage(
            {
              message: {
                type: 'set-shared-state',
                value: stateObj,
              },
            },
            '*',
          );
        }
        return stateObj;
      });

    }, [broadcast, callObject],
  );

  // returns back the sharedState and the setSharedState function
  return { sharedState: state.sharedState, setSharedState };
};