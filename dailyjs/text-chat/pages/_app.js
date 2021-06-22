import React from 'react';
import App from '@dailyjs/basic-call/pages/_app';

import ChatAside from '../components/ChatAside/ChatAside';
import Tray from '../components/Tray';

App.asides = [ChatAside];
App.customTrayComponent = <Tray />;

export default App;
