import React from 'react';

import App from '@custom/basic-call/pages/_app';
import AppWithBreakoutRooms from '../components/App';

import BreakoutRoomModal from '../components/BreakoutRoomModal';
import Tray from '../components/Tray';

App.customTrayComponent = <Tray />;
App.modals = [BreakoutRoomModal];
App.customAppComponent = <AppWithBreakoutRooms />;

export default App;
