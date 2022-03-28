import React from 'react';
import App from '@custom/basic-call/pages/_app';

import { LiveStreamingModal } from '../components/LiveStreamingModal';
import Tray from '../components/Tray';

App.modals = [LiveStreamingModal];
App.customTrayComponent = <Tray />;

export default App;
