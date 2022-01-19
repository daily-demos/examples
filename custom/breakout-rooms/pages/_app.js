import React from 'react';

import App from '@custom/basic-call/pages/_app';
import AppWithBreakoutRooms from '../components/App';

import Tray from '../components/Tray';

App.customTrayComponent = <Tray />;
App.customAppComponent = <AppWithBreakoutRooms />;

export default App;
