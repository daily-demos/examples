import React from 'react';
import App from '@dailyjs/basic-call/pages/_app';
import ChatAside from '@dailyjs/text-chat/components/ChatAside';
import Tray from '../components/Tray';

App.customTrayComponent = <Tray />;
App.asides = [ChatAside];

export default App;
