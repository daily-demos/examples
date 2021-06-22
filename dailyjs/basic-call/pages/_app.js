import React from 'react';
import GlobalHead from '@dailyjs/shared/components/GlobalHead';
import GlobalStyle from '@dailyjs/shared/components/GlobalStyle';
import Head from 'next/head';
import PropTypes from 'prop-types';

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Daily - {process.env.PROJECT_TITLE}</title>
      </Head>
      <GlobalHead />
      <GlobalStyle />
      <Component asides={App.asides} {...pageProps} />
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

export default App;
