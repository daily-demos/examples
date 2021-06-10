import React, { useCallback, useEffect, useMemo } from 'react';
import Loader from '@dailyjs/shared/components/Loader';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import {
  CALL_STATE_ENDED,
  CALL_STATE_JOINED,
  CALL_STATE_JOINING,
  CALL_STATE_LOBBY,
  CALL_STATE_NOT_FOUND,
  CALL_STATE_NOT_BEFORE,
  CALL_STATE_READY,
  CALL_STATE_REDIRECTING,
} from '@dailyjs/shared/contexts/useCallMachine';

import { useRouter } from 'next/router';
import HairCheck from '../HairCheck';
import MessageCard from '../MessageCard';
import Room from '../Room';
import { Modals } from './Modals';

export const App = () => {
  const { state, leave } = useCallState();
  const router = useRouter();

  useEffect(() => {
    console.log(`%c🔀 App state changed: ${state}`, `color: gray;`);
  }, [state]);

  const renderState = useCallback(() => {
    // Show loader when state is undefined or ready to join
    if (!state || [CALL_STATE_READY, CALL_STATE_JOINING].includes(state)) {
      return <Loader />;
    }

    // Update the UI based on the state of our call
    switch (state) {
      case CALL_STATE_NOT_FOUND:
        router.replace('/not-found');
        return null;
      case CALL_STATE_NOT_BEFORE:
        return (
          <MessageCard error header="Cannot join before owner">
            This room has `nbf` set, meaning you cannot join the call before the
            owner
          </MessageCard>
        );
      case CALL_STATE_READY:
      case CALL_STATE_LOBBY:
        return <HairCheck />;
      case CALL_STATE_JOINED:
        return <Room onLeave={() => leave()} />;
      case CALL_STATE_REDIRECTING:
      case CALL_STATE_ENDED:
        // Note: you could set a manual redirect here but we'll show just an exit screen
        return (
          <MessageCard onBack={() => window.location.reload()}>
            You have left the call. We hope you had fun!
          </MessageCard>
        );
      default:
        break;
    }

    return (
      <MessageCard error header="An error occured">
        An unknown error has occured in the call loop. This should not happen!
      </MessageCard>
    );
  }, [leave, router, state]);

  // Memoize children to avoid unnecassary renders from HOC
  return useMemo(
    () => (
      <div className="app">
        {renderState()}
        <Modals />
        <style jsx>{`
          color: white;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;

          .loader {
            margin: 0 auto;
          }
        `}</style>
      </div>
    ),
    [renderState]
  );
};

export default App;
