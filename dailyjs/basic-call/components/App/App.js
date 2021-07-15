import React, { useState, useEffect, useMemo } from 'react';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import { useCallUI } from '@dailyjs/shared/hooks/useCallUI';

import Room from '../Room';
import { Asides } from './Asides';
import { Modals } from './Modals';

export const App = () => {
  const { roomExp, state } = useCallState();
  const [secs, setSecs] = useState();

  // If room has an expiry time, we'll calculate how many seconds until expiry
  useEffect(() => {
    if (!roomExp) {
      return false;
    }
    const i = setInterval(() => {
      const timeLeft = Math.round((roomExp - Date.now()) / 1000);
      setSecs(`${Math.floor(timeLeft / 60)}:${`0${timeLeft % 60}`.slice(-2)}`);
    }, 1000);
    return () => clearInterval(i);
  }, [roomExp]);

  const componentForState = useCallUI({
    state,
    room: () => <Room />,
  });

  // Memoize children to avoid unnecassary renders from HOC
  const memoizedApp = useMemo(
    () => (
      <div className="app">
        {componentForState()}
        <Modals />
        <Asides />
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
    [componentForState]
  );

  return (
    <>
      {roomExp && <div className="countdown">{secs}</div>} {memoizedApp}
      <style jsx>{`
        .countdown {
          position: fixed;
          top: 0px;
          right: 0px;
          width: 48px;
          text-align: center;
          padding: 4px 0;
          font-size: 0.875rem;
          font-weight: var(--weight-medium);
          border-radius: 0 0 0 var(--radius-sm);
          background: var(--blue-dark);
          color: white;
          z-index: 999;
        }
      `}</style>
    </>
  );
};

export default App;
