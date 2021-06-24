import React from 'react';
import App from '@dailyjs/basic-call/pages/_app';
import AppWithChat from '../components/App';

import { LiveStreamingModal } from '../components/LiveStreamingModal';
import Tray from '../components/Tray';

App.modals = [LiveStreamingModal];
App.customAppComponent = <AppWithChat />;
App.customTrayComponent = <Tray />;

export default App;
