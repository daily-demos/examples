import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@custom/shared/components/Card';
import Loader from '@custom/shared/components/Loader';
import Well from '@custom/shared/components/Well';
import PropTypes from 'prop-types';

export const CreatingRoom = ({ onCreated }) => {
  const [room, setRoom] = useState();
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (room) return;

    async function createRoom() {
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

    createRoom();
  }, [room]);

  useEffect(() => {
    if (!room || !onCreated) return;

    console.log(`🚪 Room created: ${room}, joining now`);

    onCreated(room, true);
  }, [room, onCreated]);

  return (
    <div className="creating-room">
      {fetching && (
        <div className="creating">
          <Loader /> Creating new demo room...
        </div>
      )}
      {error && (
        <Card error>
          <CardHeader>An error occured</CardHeader>
          <CardBody>
            <Well variant="error">{error}</Well>
            An error occured when trying to create a demo room. Please check
            that your environmental variables are correct and try again.
          </CardBody>
        </Card>
      )}

      <style jsx>
        {`
          .creating-room {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            max-width: 420px;
            margin: 0 auto;
          }

          .creating-room .creating {
            display: flex;
          }

          .creating-room :global(.loader) {
            margin-right: var(--spacing-xxxs);
          }
        `}
      </style>
    </div>
  );
};

CreatingRoom.propTypes = {
  onCreated: PropTypes.func.isRequired,
};

export default CreatingRoom;
