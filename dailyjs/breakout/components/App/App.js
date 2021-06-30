import React from 'react';

import App from '@dailyjs/basic-call/components/App';
import { BreakoutProvider } from '../../contexts/BreakoutProvider';

// Extend our basic call app with additional breakout rooms context
export const AppWithBreakout = () => (
  <BreakoutProvider>
    <App />
  </BreakoutProvider>
);

export default AppWithBreakout;
