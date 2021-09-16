import React, { useCallback, useRef, useState } from 'react';
import { Button } from '@dailyjs/shared/components/Button';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@dailyjs/shared/components/Card';
import { CreateRoom } from '../components/CreateRoom';
import { Field } from '@dailyjs/shared/components/Field';
import { TextInput } from '@dailyjs/shared/components/Input';

export default function Home({ setRoom, setExpiry, isConfigured }) {
  const roomRef = useRef(null);
  const [isValidRoom, setIsValidRoom] = useState(false);

  /**
   * If the room is valid, setIsValidRoom and enable the join button
   */
  const checkValidity = useCallback(
    (e) => {
      if (e?.target?.checkValidity()) {
        setIsValidRoom(true);
      }
    },
    [isValidRoom]
  );

  /**
   * Set the roomUrl in local state to trigger Daily iframe creation in <Call />
   */
  const joinCall = useCallback(() => {
    const roomUrl = roomRef?.current?.value;
    setRoom(roomUrl);
  }, [roomRef]);

  return (
    <Card>
      <CardHeader>
        Start demo with a new unique room, or paste in your own room URL
      </CardHeader>
      <CardBody>
        <CreateRoom
          isConfigured={isConfigured}
          isValidRoom={isValidRoom}
          setRoom={setRoom}
          setExpiry={setExpiry}
        />
        <Field label="Or enter room to join">
          <TextInput
            ref={roomRef}
            type="text"
            placeholder="Enter room URL..."
            pattern="^(https:\/\/)?[\w.-]+(\.(daily\.(co)))+[\/\/]+[\w.-]+$"
            onChange={checkValidity}
          />
        </Field>
        <CardFooter>
          <Button onClick={joinCall} disabled={!isValidRoom}>
            Join room
          </Button>
        </CardFooter>
      </CardBody>
    </Card>
  );
}
