import React from 'react';

import App from '@dailyjs/basic-call/components/App';
import Room from '@dailyjs/basic-call/components/Room';
import PaginatedVideoGrid from '../PaginatedVideoGrid';

/**
 * Rather than create an entirely new Room component we'll
 * pass use the one in basic call with a custom MainComponent
 */
export const AppWithPagination = () => (
  <App
    customComponentForState={{
      room: () => <Room MainComponent={PaginatedVideoGrid} />,
    }}
  />
);

export default AppWithPagination;
