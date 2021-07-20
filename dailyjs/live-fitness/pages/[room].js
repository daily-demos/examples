import React, { useState, useEffect } from 'react';
import { CallProvider } from '@dailyjs/shared/contexts/CallProvider';
import { MediaDeviceProvider } from '@dailyjs/shared/contexts/MediaDeviceProvider';
import { ParticipantsProvider } from '@dailyjs/shared/contexts/ParticipantsProvider';
import { TracksProvider } from '@dailyjs/shared/contexts/TracksProvider';
import { UIStateProvider } from '@dailyjs/shared/contexts/UIStateProvider';
import { WaitingRoomProvider } from '@dailyjs/shared/contexts/WaitingRoomProvider';
import getDemoProps from '@dailyjs/shared/lib/demoProps';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import App from '../components/App';

/**
 * Room page
 * ---
 */
export default function Room({
  room,
  instructor,
  domain,
  customTrayComponent,
  asides,
}) {
  const [token, setToken] = useState();
  const [tokenError, setTokenError] = useState();

  const router = useRouter();

  // Redirect to a 404 if we do not have a room
  useEffect(
    () => (!room || !domain) && router.replace('/not-found'),
    [room, domain, router]
  );

  // Fetch a meeting token
  useEffect(() => {
    if (token || !room) {
      return;
    }

    // We're using a simple Next serverless function to generate meeting tokens
    // which could be replaced with your own serverside method that authenticates
    // users / sets room owner status, user ID, user names etc
    async function getToken() {
      console.log(`🪙 Fetching meeting token for room '${room}'`);

      const res = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: room, isOwner: !!instructor }),
      });

      const resJson = await res.json();

      if (!resJson?.token) {
        setTokenError(resJson?.error || true);
      }

      console.log(`🪙 Meeting token received`);

      setToken(resJson.token);
    }

    getToken();
  }, [token, room, instructor]);

  if (!token) {
    return <div>Fetching token...</div>;
  }

  if (tokenError) {
    return <div>Token error</div>;
  }

  /**
   * Main call UI
   */
  return (
    <UIStateProvider customTrayComponent={customTrayComponent} asides={asides}>
      <CallProvider domain={domain} room={room} token={token}>
        <ParticipantsProvider>
          <TracksProvider>
            <MediaDeviceProvider>
              <WaitingRoomProvider>
                <App />
              </WaitingRoomProvider>
            </MediaDeviceProvider>
          </TracksProvider>
        </ParticipantsProvider>
      </CallProvider>
    </UIStateProvider>
  );
}

Room.propTypes = {
  room: PropTypes.string.isRequired,
  domain: PropTypes.string.isRequired,
  instructor: PropTypes.bool,
  customTrayComponent: PropTypes.node,
  asides: PropTypes.arrayOf(PropTypes.func),
};

export async function getServerSideProps(context) {
  const { room, instructor } = context.query;
  const defaultProps = getDemoProps();

  return {
    props: { room, instructor: !!instructor, ...defaultProps },
  };
}
