import React, { useState } from 'react';
import { Button } from '@dailyjs/shared/components/Button';
import Field from '@dailyjs/shared/components/Field';
import { TextInput, BooleanInput } from '@dailyjs/shared/components/Input';
import MessageCard from '@dailyjs/shared/components/MessageCard';
import Image from 'next/image';
import PropTypes from 'prop-types';
import { ReactComponent as DailyLogo } from '../public/images/daily-logo.svg';
import SplashImage from '../public/images/splash.jpg';

export default function Index({ isConfigured, domain }) {
  const [fetching, setFetching] = useState(false);
  const [joinedAsOwner, setJoinAsOwner] = useState(false);
  const [roomName, setRoomName] = useState();

  if (!isConfigured) {
    return (
      <main>
        <MessageCard error hideBack>
          <p>
            Please ensure you have set both the <code>DAILY_API_KEY</code> and{' '}
            <code>DAILY_DOMAIN</code> environmental variables. An example can be
            found in the provided <code>env.example</code> file.
          </p>
          <p>
            If you do not yet have a Daily developer account, please{' '}
            <a
              href="https://dashboard.daily.co/signup"
              target="_blank"
              rel="noreferrer"
            >
              create one now
            </a>
            . You can find your Daily API key on the{' '}
            <a
              href="https://dashboard.daily.co/developers"
              target="_blank"
              rel="noreferrer"
            >
              developer page
            </a>{' '}
            of the dashboard.
          </p>
        </MessageCard>
        <style jsx>
          {`
            main {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              max-width: 600px;
              margin: 0 auto;
            }
          `}
        </style>
      </main>
    );
  }
  return (
    <main>
      <div className="splash">
        <Image
          src={SplashImage}
          alt=""
          layout="fill"
          objectFit="cover"
          placeholder="blur"
        />
      </div>
      <aside>
        <DailyLogo />
        <p>
          This example shows common patterns used when creating an online
          fitness experience. To get started, please create a room on your Daily
          account and join below.
        </p>

        <hr />

        <Field label="Enter room to join">
          <TextInput
            type="text"
            prefix={`${domain}.daily.co/`}
            placeholder="Room name"
            defaultValue={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />
        </Field>

        <Field label="Join as instructor">
          <BooleanInput onChange={(e) => setJoinAsOwner(e.target.checked)} />
        </Field>

        <Button disabled={!roomName || fetching}>
          {fetching ? 'Fetching token...' : 'Join room'}
        </Button>
      </aside>
      <style jsx>
        {`
          main {
            width: 100%;
            height: 100vh;
            display: grid;
            grid-template-columns: auto 40%;
          }

          .splash {
            position: relative;
            width: 100%;
            height: 100%;
          }

          aside {
            background: white;
            padding: var(--spacing-sm);
            color: var(--blue-dark);
          }

          aside p {
            color: var(--text-default);
          }
        `}
      </style>
    </main>
  );
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
