import React, { useCallback, useEffect } from 'react';
import Loader from '@custom/shared/components/Loader';
import MessageCard from '@custom/shared/components/MessageCard';
import {
  CALL_STATE_ENDED,
  CALL_STATE_JOINED,
  CALL_STATE_JOINING,
  CALL_STATE_LOBBY,
  CALL_STATE_NOT_FOUND,
  CALL_STATE_NOT_BEFORE,
  CALL_STATE_READY,
  CALL_STATE_REDIRECTING,
  CALL_STATE_NOT_ALLOWED,
  CALL_STATE_EXPIRED,
} from '@custom/shared/contexts/useCallMachine';
import { useRouter } from 'next/router';
import HairCheck from '../components/HairCheck';

export const useCallUI = ({
  state,
  room,
  haircheck,
  redirectUrl,
  callEnded,
  notFoundRedirect = 'not-found',
}) => {
  const router = useRouter();

  useEffect(() => {
    console.log(`%c🔀 App state changed: ${state}`, `color: gray;`);
  }, [state]);

  const renderByState = useCallback(() => {
    // Show loader when state is undefined or ready to join
    if (!state || [CALL_STATE_READY, CALL_STATE_JOINING].includes(state)) {
      return <Loader />;
    }

    // Update the UI based on the state of our call
    switch (state) {
      case CALL_STATE_NOT_FOUND:
        router.replace(notFoundRedirect);
        return null;
      case CALL_STATE_NOT_ALLOWED:
        return (
          <MessageCard error header="Access denied">
            You are not allowed to join this meeting. Please make sure you have
            a valid meeting token.
          </MessageCard>
        );
      case CALL_STATE_NOT_BEFORE:
        return (
          <MessageCard error header="Cannot join before owner">
            This room has `nbf` set, meaning you cannot join the call before the
            owner
          </MessageCard>
        );
      case CALL_STATE_EXPIRED:
        return (
          <MessageCard error header="Room expired">
            The room you are trying to join has expired. Please create or join
            another room.
          </MessageCard>
        );
      case CALL_STATE_LOBBY:
        return haircheck ? haircheck() : <HairCheck />;
      case CALL_STATE_JOINED:
        return room ? (
          room
        ) : (
          <MessageCard error header="No room component declared" />
        );
      case CALL_STATE_REDIRECTING:
        if (!redirectUrl) {
          break;
        }
        window.location = redirectUrl;
        break;
      case CALL_STATE_ENDED:
        return callEnded ? (
          callEnded()
        ) : (
          <MessageCard>
            You have left the call (either manually or because the room
            expired). We hope you had fun!
          </MessageCard>
        );
      default:
        break;
    }

    return (
      <MessageCard error header="An unknown error occured">
        A fatal error occured in the call loop. Please check you have entered a
        valid <code>DAILY_DOMAIN</code> and <code>DAILY_API_KEY</code>{' '}
        environmental variables.
      </MessageCard>
    );
  }, [
    state,
    notFoundRedirect,
    redirectUrl,
    haircheck,
    room,
    callEnded,
    router,
  ]);

  return renderByState;
};

export default useCallUI;
