import React from 'react';
import getDemoProps from '@dailyjs/shared/lib/demoProps';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Splash from '../components/Splash';

/**
 * Index page
 * ---
 */
export default function Index({ domain, isConfigured = false }) {
  const router = useRouter();

  function joinRoom(room, joinAsInstructor) {
    // redirect to room....
    console.log(room);
    console.log(joinAsInstructor);

    router.replace(`/${room}/`);
  }

  return (
    <Splash domain={domain} onJoin={joinRoom} isConfigured={!!isConfigured} />
  );
}

Index.propTypes = {
  isConfigured: PropTypes.bool.isRequired,
  domain: PropTypes.string,
};

export async function getStaticProps() {
  const defaultProps = getDemoProps();

  return {
    props: defaultProps,
  };
}
