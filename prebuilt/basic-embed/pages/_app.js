import React from 'react';
import GlobalHead from '@dailyjs/shared/components/GlobalHead';
import GlobalStyle from '@dailyjs/shared/components/GlobalStyle';
import Head from 'next/head';

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Daily Prebuilt + Next.js demo</title>
        <meta
          name="description"
          content="Daily Prebuilt video chat interface embedded in a Next.js app."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GlobalHead />
      <GlobalStyle />
      <Component {...pageProps} />
    </>
  );
}

export default App;
