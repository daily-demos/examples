import React from 'react';
import App from '@custom/basic-call/pages/_app';
import AppWithTranscription from '../components/App';

import TranscriptionAside from '../components/TranscriptionAside';
import Tray from '../components/Tray';

App.asides = [TranscriptionAside];
App.customAppComponent = <AppWithTranscription />;
App.customTrayComponent = <Tray />;

export default App;
