import React from 'react';
import App from '@custom/basic-call/pages/_app';
import AppWithMusicMode from '../components/App';
import MusicModal from '../components/MusicModal';
import Tray from '../components/Tray';

App.modals = [MusicModal];
App.customAppComponent = <AppWithMusicMode />;
App.customTrayComponent = <Tray />;

export default App;
