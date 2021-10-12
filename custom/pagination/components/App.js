import React from 'react';

import App from '@custom/basic-call/components/App';
import Room from '@custom/basic-call/components/Call/Room';
import PaginatedVideoGrid from './PaginatedVideoGrid';

export const AppWithPagination = () => (
  <App
    customComponentForState={{
      room: (
        <Room>
          <PaginatedVideoGrid />
        </Room>
      ),
    }}
  />
);

export default AppWithPagination;
