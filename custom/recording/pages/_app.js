import React from 'react';
import App from '@custom/basic-call/pages/_app';
import AppWithRecording from '../components/App';

import { RecordingModal } from '../components/RecordingModal';
import Tray from '../components/Tray';

App.modals = [RecordingModal];
App.customAppComponent = <AppWithRecording />;
App.customTrayComponent = <Tray />;

export default App;
