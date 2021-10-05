import React from 'react';
import App from '@custom/basic-call/pages/_app';
import AppWithEmojis from '../components/App';
import Tray from '../components/Tray';

App.customAppComponent = <AppWithEmojis />;
App.customTrayComponent = <Tray />;

export default App;
