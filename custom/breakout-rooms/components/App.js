import React from 'react';

import App from '@custom/basic-call/components/App';
import Room from '@custom/basic-call/components/Call/Room';

export const AppWithPagination = () => (
  <App
    customComponentForState={{
      room: <Room />,
    }}
  />
);

export default AppWithPagination;
