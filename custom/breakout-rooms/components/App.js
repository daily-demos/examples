import React, { useMemo } from 'react';
import Modals from '@custom/basic-call/components/App/Modals';
import ExpiryTimer from '@custom/shared/components/ExpiryTimer';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useCallUI } from '@custom/shared/hooks/useCallUI';
import PropTypes from 'prop-types';

import { Asides } from './Asides';
import { BreakoutRoomProvider } from './BreakoutRoomProvider';
import Room from './Room';

export const App = ({ customComponentForState }) => {
  const { roomExp, state } = useCallState();

  const componentForState = useCallUI({
    state,
    room: <Room />,
    ...customComponentForState,
  });

  // Memoize children to avoid unnecassary renders from HOC
  return useMemo(
    () => (
      <BreakoutRoomProvider>
        {roomExp && <ExpiryTimer expiry={roomExp} />}
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
      </BreakoutRoomProvider>
    ),
    [componentForState, roomExp]
  );
};

App.propTypes = {
  customComponentForState: PropTypes.any,
};

export default App;