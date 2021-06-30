import React from 'react';
import App from '@dailyjs/basic-call/pages/_app';
import AppWithBreakout from '../components/App';

import BreakoutAside from '../components/BreakoutAside';
import Tray from '../components/Tray';

App.asides = [BreakoutAside];
App.customAppComponent = <AppWithBreakout />;
App.customTrayComponent = <Tray />;

export default App;



