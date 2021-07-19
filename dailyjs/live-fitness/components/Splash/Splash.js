import React, { useState } from 'react';

import Button from '@dailyjs/shared/components/Button';
import PropTypes from 'prop-types';

export const Splash = ({ domain, onJoin, isConfigured }) => {
  // const [joinAsInstructor, setJoinAsInstructor] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(false);
  const [room, setRoom] = useState('');

  async function createRoom() {
    // Create a room

    setError(false);
    setFetching(true);

    console.log(`🚪 Creating new demo room...`);

    // Create a room server side (using Next JS serverless)
    const res = await fetch('/api/createRoom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    if (resJson.name) {
      setFetching(false);
      setRoom(resJson.name);
      return;
    }

    setError(resJson.error || 'An unknown error occured');
    setFetching(false);
  }

  return (
    <div className="container">
      <aside />

      <main>
        <header className="branding">
          <img src="/assets/daily-logo-dark.svg" alt="Daily" />
        </header>
        <div className="inner">
          {!isConfigured ? (
            <div>
              You must set <code>Stuff</code>
            </div>
          ) : (
            <Button onClick={() => createRoom()}>
              {fetching ? 'Creating room...' : 'Join'}
            </Button>
          )}
        </div>
      </main>

      <style jsx>
        {`
          .container {
            display: grid;
            grid-template-columns: auto 620px;
            height: 100vh;
          }

          main {
            background: white;
            display: flex;
            flex-flow: column wrap;
            padding: var(--spacing-sm);
            box-sizing: border-box;
          }

          main .inner {
            display: flex;
            flex: 1;
            align-items: center;
          }

          .branding {
            flex: 0;
          }

          aside {
            background: url(/images/fitness-bg.jpg) no-repeat;
            background-size: cover;
          }
        `}
      </style>
    </div>
  );
};

Splash.propTypes = {
  domain: PropTypes.string,
  onJoin: PropTypes.func,
  isConfigured: PropTypes.bool,
};

export default Splash;
