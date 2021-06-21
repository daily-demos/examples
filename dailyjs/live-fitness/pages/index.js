import React from 'react';
import PropTypes from 'prop-types';

export default function Index({ domain, isConfigured }) {
  return <div>Hello</div>;
}

Index.propTypes = {
  isConfigured: PropTypes.bool.isRequired,
  domain: PropTypes.string,
};

export async function getStaticProps() {
  // Check that both domain and key env vars are set
  const isConfigured =
    !!process.env.DAILY_DOMAIN && !!process.env.DAILY_API_KEY;

  // Pass through domain as prop
  return {
    props: { domain: process.env.DAILY_DOMAIN || null, isConfigured },
  };
}
