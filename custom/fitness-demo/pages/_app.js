import React from 'react';
import GlobalStyle from '@custom/shared/components/GlobalStyle';
import Head from 'next/head';
import PropTypes from 'prop-types';
import { App as CustomApp } from '../components/App/App';
import ChatAside from '../components/Call/ChatAside';
import LiveStreamingModal from '../components/Modals/LiveStreamingModal';
import RecordingModal from '../components/Modals/RecordingModal';
import Tray from '../components/Tray';

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Daily - {process.env.PROJECT_TITLE}</title>
      </Head>
      <GlobalStyle />
      <Component
        asides={App.asides}
        modals={App.modals}
        customTrayComponent={App.customTrayComponent}
        customAppComponent={App.customAppComponent}
        {...pageProps}
      />
    </>
  );
}

App.defaultProps = {
  Component: null,
  pageProps: {},
};

App.propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.object,
};

App.asides = [ChatAside];
App.modals = [RecordingModal, LiveStreamingModal];
App.customTrayComponent = <Tray />;
App.customAppComponent = <CustomApp />;

export default App;
