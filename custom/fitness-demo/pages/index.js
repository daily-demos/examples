import React, { useState, useCallback } from 'react';
import { CallProvider } from '@custom/shared/contexts/CallProvider';
import { MediaDeviceProvider } from '@custom/shared/contexts/MediaDeviceProvider';
import { ParticipantsProvider } from '@custom/shared/contexts/ParticipantsProvider';
import { TracksProvider } from '@custom/shared/contexts/TracksProvider';
import { UIStateProvider } from '@custom/shared/contexts/UIStateProvider';
import { WaitingRoomProvider } from '@custom/shared/contexts/WaitingRoomProvider';
import getDemoProps from '@custom/shared/lib/demoProps';
import PropTypes from 'prop-types';
import App from '../components/App';
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
  forceFetchToken = false,
  forceOwner = false,
  subscribeToTracksAutomatically = true,
  demoMode = false,
  asides,
  modals,
  customTrayComponent,
  customAppComponent,
}) {
  const [roomName, setRoomName] = useState();
  const [fetching, setFetching] = useState(false);
  const [token, setToken] = useState();
  const [error, setError] = useState();

  const createRoom = async (room, duration, privacy) => {
    setError(false);
    setFetching(true);

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
      setFetching(false);
      setRoomName(resJson.name);
      return;
    }

    setError(resJson.error || 'An unknown error occured');
    setFetching(false);
  }

  const isReady = !!(isConfigured && roomName);

  if (!isReady) {
    return (
      <main>
        {(() => {
          if (!isConfigured) return <NotConfigured />;
          return (
            <Intro
              room={roomName}
              domain={domain}
              onJoin={(room, type, duration = 60, privacy = 'public') =>
                type === 'join' ? setRoomName(room): createRoom(room, duration, privacy)
              }
            />
          );
        })()}

        <style jsx>{`
          height: 100vh;
          display: grid;
          align-items: center;
          justify-content: center;
        `}</style>
      </main>
    );
  }

  /**
   * Main call UI
   */
  return (
    <UIStateProvider
      asides={asides}
      modals={modals}
      customTrayComponent={customTrayComponent}
    >
      <CallProvider
        domain={domain}
        room={roomName}
        token={token}
        subscribeToTracksAutomatically={subscribeToTracksAutomatically}
      >
        <ParticipantsProvider>
          <TracksProvider>
            <MediaDeviceProvider>
              <WaitingRoomProvider>
                {customAppComponent || <App />}
              </WaitingRoomProvider>
            </MediaDeviceProvider>
          </TracksProvider>
        </ParticipantsProvider>
      </CallProvider>
    </UIStateProvider>
  );
}

Index.propTypes = {
  isConfigured: PropTypes.bool.isRequired,
  domain: PropTypes.string,
  asides: PropTypes.arrayOf(PropTypes.func),
  modals: PropTypes.arrayOf(PropTypes.func),
  customTrayComponent: PropTypes.node,
  customAppComponent: PropTypes.node,
  forceFetchToken: PropTypes.bool,
  forceOwner: PropTypes.bool,
  subscribeToTracksAutomatically: PropTypes.bool,
  demoMode: PropTypes.bool,
};

export async function getStaticProps() {
  const defaultProps = getDemoProps();
  return {
    props: defaultProps,
  };
}
