import React, { useState } from 'react';

import Button from '@dailyjs/shared/components/Button';
import Loader from '@dailyjs/shared/components/Loader';
import { Well } from '@dailyjs/shared/components/Well';
import PropTypes from 'prop-types';

/**
 * Splash
 * ---
 * - Checks our app is configured properly
 * - Creates a new Daily room for this session
 * - Calls the onJoin method with the room name and instructor (owner) status
 */
export const Splash = ({ onJoin, isConfigured }) => {
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(false);

  async function createRoom(asInstructor) {
    // Create a new room for this class
    setError(false);
    setFetching(true);

    console.log(`🚪 Creating new demo room...`);

    // Create a room server side (using Next JS serverless)
    const res = await fetch('/api/createRoom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        privacy: 'private',
        expiryMinutes: 10,
      }),
    });

    const resJson = await res.json();

    if (resJson.name) {
      onJoin(resJson.name, asInstructor);
      return;
    }

    setError(resJson.error || 'An unknown error occured');
    setFetching(false);
  }

  return (
    <div className="container">
      <aside>
        <a href="https://unsplash.com/@jordannix?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
          Photo by Jordan Nix on Unsplash
        </a>
      </aside>

      <main>
        <img
          src="/assets/daily-logo-dark.svg"
          alt="Daily"
          className="branding"
        />

        <div className="inner">
          {(() => {
            // Application is not yet configured (there are missing globals, such as domain and dev key)
            if (!isConfigured)
              return (
                <>
                  <h2>Not configured</h2>
                  <p>
                    Please ensure you have set both the{' '}
                    <code>DAILY_API_KEY</code> and <code>DAILY_DOMAIN</code>{' '}
                    environmental variables. An example can be found in the
                    provided <code>env.example</code> file.
                  </p>
                  <p>
                    If you do not yet have a Daily developer account, please{' '}
                    <a
                      href="https://dashboard.daily.co/signup"
                      target="_blank"
                      rel="noreferrer"
                    >
                      create one now
                    </a>{' '}
                    . You can find your Daily API key on the{' '}
                    <a
                      href="https://dashboard.daily.co/developers"
                      target="_blank"
                      rel="noreferrer"
                    >
                      developer page
                    </a>
                    of the dashboard.
                  </p>
                </>
              );

            // There was an error creating the room
            if (error)
              return (
                <div>
                  <Well variant="error">{error}</Well>
                  An error occured when trying to create a demo room. Please
                  check that your environmental variables are correct and try
                  again.
                </div>
              );

            // Loader whilst we create the room
            if (fetching)
              return (
                <>
                  <Loader /> <p>Creating room, please wait...</p>
                </>
              );

            // Introductory splash screen
            return (
              <>
                <h2>Live fitness example</h2>
                <p>
                  This example demonstrates how to use Daily JS to create a live
                  class experience. Please be sure to reference the project
                  readme first.
                </p>
                <p>
                  Note: all rooms created with this demo will have a 5 minute
                  expiry time. If you would like to create a longer running
                  room, please set the <code>DAILY_ROOM</code> environmental
                  variable to use your own custom room.
                </p>
                <hr />
                <footer>
                  <Button
                    fullWidth
                    onClick={() => createRoom(true)}
                    disabled={fetching}
                  >
                    Join as instructor
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => createRoom(false)}
                    variant="outline-gray"
                    disabled={fetching}
                  >
                    Join as student
                  </Button>
                </footer>
              </>
            );
          })()}
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

          p {
            color: var(--text-mid);
          }

          main .inner {
            flex: 0;
            margin: auto 0;
          }

          .branding {
            flex: 0;
            width: 108px;
          }

          hr {
            margin: var(--spacing-md) 0;
          }

          aside {
            background: url(/images/fitness-bg.jpg) no-repeat;
            background-size: cover;
            color: white;
            font-size: 0.875rem;
            display: flex;
            align-items: flex-end;
            padding: var(--spacing-xs);
            box-sizing: border-box;
          }

          aside a {
            color: white;
            opacity: 0.65;
          }

          footer {
            display: flex;
            gap: var(--spacing-xxs);
          }
        `}
      </style>
    </div>
  );
};

Splash.propTypes = {
  onJoin: PropTypes.func,
  isConfigured: PropTypes.bool,
};

export default Splash;
