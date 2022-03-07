import React, { useState, useCallback } from 'react';
import getDemoProps from '@custom/shared/lib/demoProps';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import Intro from '../components/Prejoin/Intro';
import NotConfigured from '../components/Prejoin/NotConfigured';

/**
 * Index page
 * ---
 * - Checks configuration variables are set in local env
 * - Optionally obtain a meeting token from Daily REST API (./pages/api/token)
 * - Set call owner status
 * - Finally, renders the main application loop
 */
export default function Index({
  domain,
  isConfigured = false,
}) {
  const router = useRouter();
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState();

  const [fetchingToken, setFetchingToken] = useState(false);
  const [tokenError, setTokenError] = useState();

  const getMeetingToken = useCallback(async (room, isOwner = false) => {
    if (!room) return false;

    setFetchingToken(true);

    // Fetch token from serverside method (provided by Next)
    const res = await fetch('/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomName: room, isOwner }),
    });
    const resJson = await res.json();

    if (!resJson?.token) {
      setTokenError(resJson?.error || true);
      setFetchingToken(false);
      return false;
    }

    console.log(`🪙 Token received`);

    setFetchingToken(false);
    await router.push(`/${room}?t=${resJson.token}`);

    return true;
  }, [router]);

  const createRoom = async (room, duration, privacy) => {
    setError(false);
    setFetching(true);

    console.log(`🚪 Verifying if there's a class with same name`);

    const verifyingRes = await fetch(`/api/room?name=${room}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const verifyingResJson = await verifyingRes.json();

    // it throws an error saying not-found if the room doesn't exist.
    // so we create a new room here.
    if (verifyingResJson.error === 'not-found') {
      console.log(`🚪 Creating a new class...`);

      // Create a room server side (using Next JS serverless)
      const res = await fetch('/api/createRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: room,
          expiryMinutes: Number(duration),
          privacy: !privacy ? 'private': 'public'
        }),
      });

      const resJson = await res.json();

      if (resJson.name) {
        await getMeetingToken(resJson.name, true);
        return;
      }

      setError(resJson?.info || resJson?.error || 'An unknown error occured');
    } else {
      if (verifyingResJson.name) {
        const editRes = await fetch(`/api/editRoom?roomName=${room}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            expiryMinutes: Number(duration),
            privacy: !privacy ? 'private': 'public'
          }),
        });

        const editResJson = await editRes.json();
        await getMeetingToken(editResJson.name, true);
        return;
      }
    }

    setFetching(false);
  }

  /**
   * Main call UI
   */
  return (
    <main>
      {(() => {
        if (!isConfigured) return <NotConfigured />;
        return (
          <Intro
            tokenError={tokenError}
            fetching={fetching}
            error={error}
            domain={domain}
            onJoin={(room, type, duration = 60, privacy = 'public') =>
              type === 'join' ? router.push(`/${room}`): createRoom(room, duration, privacy)
            }
          />
        );
      })()}

      <style jsx>{`
        height: 100vh;
        display: grid;
        align-items: center;
        justify-content: center;
        background: var(--reverse);
      `}</style>
    </main>
  );
}

Index.propTypes = {
  isConfigured: PropTypes.bool.isRequired,
  domain: PropTypes.string,
  asides: PropTypes.arrayOf(PropTypes.func),
  modals: PropTypes.arrayOf(PropTypes.func),
  customTrayComponent: PropTypes.node,
  customAppComponent: PropTypes.node,
  subscribeToTracksAutomatically: PropTypes.bool,
};

export async function getStaticProps() {
  const defaultProps = getDemoProps();
  return {
    props: defaultProps,
  };
}
