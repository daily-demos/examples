import React from 'react';

import App from '@dailyjs/basic-call/components/App';
import Room from '@dailyjs/basic-call/components/Room';
import PaginatedVideoGrid from '../PaginatedVideoGrid';

export const AppWithPagination = () => (
  <App
    customComponentForState={{
      room: () => <Room MainComponent={PaginatedVideoGrid} />,
    }}
  />
);

export default AppWithPagination;
