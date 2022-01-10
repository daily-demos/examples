import React, { useMemo } from 'react';
import ExpiryTimer from '@custom/shared/components/ExpiryTimer';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useCallUI } from '@custom/shared/hooks/useCallUI';
import PropTypes from 'prop-types';

import { ChatProvider } from '../../contexts/ChatProvider';
import { ClassStateProvider } from '../../contexts/ClassStateProvider';
import { LiveStreamingProvider } from '../../contexts/LiveStreamingProvider';
import { RecordingProvider } from '../../contexts/RecordingProvider';
import Room from '../Call/Room';
import { Asides } from './Asides';
import { Modals } from './Modals';

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
      <>
        <ChatProvider>
          <RecordingProvider>
            <LiveStreamingProvider>
              <ClassStateProvider>
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
              </ClassStateProvider>
            </LiveStreamingProvider>
          </RecordingProvider>
        </ChatProvider>
      </>
    ),
    [componentForState, roomExp]
  );
};

App.propTypes = {
  customComponentForState: PropTypes.any,
};

export default App;