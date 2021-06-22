import React from 'react';
import App from '@dailyjs/basic-call/pages/_app';

import Tray from '../components/Tray';

App.asides = [];
App.customTrayComponent = <Tray />;

export default App;
