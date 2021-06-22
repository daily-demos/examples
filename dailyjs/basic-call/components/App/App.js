import React, { useMemo } from 'react';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import { useCallUI } from '@dailyjs/shared/hooks/useCallUI';

import PropTypes from 'prop-types';
import Room from '../Room';
import { Asides } from './Asides';
import { Modals } from './Modals';

export const App = ({ asides }) => {
  const { state, leave } = useCallState();

  const componentForState = useCallUI({
    state,
    room: () => <Room onLeave={() => leave()} />,
  });

  // Memoize children to avoid unnecassary renders from HOC
  return useMemo(
    () => (
      <div className="app">
        {componentForState()}
        <Modals />
        <Asides asides={asides} />
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
    [componentForState, asides]
  );
};

App.propTypes = {
  asides: PropTypes.arrayOf(PropTypes.func),
};

export default App;
