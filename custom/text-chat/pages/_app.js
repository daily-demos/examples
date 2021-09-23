import React from 'react';
import App from '@custom/basic-call/pages/_app';
import AppWithChat from '../components/App';

import ChatAside from '../components/ChatAside';
import Tray from '../components/Tray';

App.asides = [ChatAside];
App.customAppComponent = <AppWithChat />;
App.customTrayComponent = <Tray />;

export default App;
