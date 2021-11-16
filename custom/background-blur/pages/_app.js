import React from 'react';
import App from '@custom/basic-call/pages/_app';
import { BackgroundBlurModal } from '../components/BackgroundBlurModal';
import Tray from '../components/Tray';

App.modals = [BackgroundBlurModal];
App.customTrayComponent = <Tray />;

export default App;
