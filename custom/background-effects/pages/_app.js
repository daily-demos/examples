import React from 'react';
import App from '@custom/basic-call/pages/_app';
import { BackgroundEffectsModal } from '../components/BackgroundEffectsModal';
import Tray from '../components/Tray';

App.modals = [BackgroundEffectsModal];
App.customTrayComponent = <Tray />;

export default App;
