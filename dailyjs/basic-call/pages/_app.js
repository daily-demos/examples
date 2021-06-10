import React from 'react';
import GlobalStyle from '@dailyjs/shared/components/GlobalStyle';
import Head from 'next/head';
import PropTypes from 'prop-types';

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Daily - Basic Call Example</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <GlobalStyle />
      <Component {...pageProps} />
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

export default App;
