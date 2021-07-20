import React from 'react';
import App from '@dailyjs/basic-call/pages/_app';
import LiveStreamingModal from '@dailyjs/live-streaming/components/LiveStreamingModal';
import RecordingModal from '@dailyjs/recording/components/RecordingModal';
import ChatAside from '@dailyjs/text-chat/components/ChatAside';
import Tray from '../components/Tray';

App.customTrayComponent = <Tray />;
App.asides = [ChatAside];
App.modals = [LiveStreamingModal, RecordingModal];

export default App;
