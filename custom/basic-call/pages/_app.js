import React from 'react';
import GlobalStyle from '@custom/shared/components/GlobalStyle';
import Head from 'next/head';
import PropTypes from 'prop-types';

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

App.asides = [];
App.modals = [];
App.customTrayComponent = null;
App.customAppComponent = null;

export default App;
