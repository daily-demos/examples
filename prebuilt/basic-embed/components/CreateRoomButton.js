import React, { useState } from 'react';
import Button from '@custom/shared/components/Button';
import Well from '@custom/shared/components/Well';

export function CreateRoomButton({
  isConfigured,
  isValidRoom,
  setRoom,
  setExpiry,
}) {
  const [isError, setIsError] = useState(false);

  /**
   * Send a request to create a Daily room server-side via Next API routes, then set the returned url in local state to trigger Daily iframe creation in <Call />
   */
  const createRoom = async () => {
    try {
      const res = await fetch('/api/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const resJson = await res.json();
      setExpiry(resJson.config?.exp);
      setRoom(resJson.url);
    } catch (e) {
      setIsError(true);
    }
  };
  return (
    <>
      {!isConfigured && (
        <Well variant="error">
          You must configure env variables to create rooms (see README
          instructions).
        </Well>
      )}
      {isError && (
        <Well variant="error">Error creating the room. Please try again.</Well>
      )}
      <Button onClick={createRoom} disabled={isValidRoom}>
        Create room and start
      </Button>
    </>
  );
}

export default CreateRoomButton;
