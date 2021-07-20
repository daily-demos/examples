import React from 'react';
import getDemoProps from '@dailyjs/shared/lib/demoProps';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Splash from '../components/Splash';

/**
 * Index page
 * ---
 */
export default function Index({ isConfigured = false }) {
  const router = useRouter();

  function joinRoom(room, joinAsInstructor) {
    // Redirect to room page
    router.replace({
      pathname: `/${room}`,
      query: { instructor: !!joinAsInstructor },
    });
  }

  return <Splash onJoin={joinRoom} isConfigured={!!isConfigured} />;
}

Index.propTypes = {
  isConfigured: PropTypes.bool.isRequired,
};

export async function getStaticProps() {
  const defaultProps = getDemoProps();

  return {
    props: defaultProps,
  };
}
