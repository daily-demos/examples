import React from 'react';
import App from '@dailyjs/basic-call/pages/_app';
import AppWithLiveStreaming from '../components/App';

import { LiveStreamingModal } from '../components/LiveStreamingModal';
import Tray from '../components/Tray';

App.modals = [LiveStreamingModal];
App.customAppComponent = <AppWithLiveStreaming />;
App.customTrayComponent = <Tray />;

export default App;
