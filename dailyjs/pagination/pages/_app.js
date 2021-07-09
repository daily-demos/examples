import React from 'react';

import App from '@dailyjs/basic-call/pages/_app';
import AppWithPagination from '../components/App';

import Tray from '../components/Tray';

App.customTrayComponent = <Tray />;
App.customAppComponent = <AppWithPagination />;

export default App;
