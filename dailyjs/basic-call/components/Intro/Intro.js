import React, { useEffect, useState } from 'react';
import { Button } from '@dailyjs/shared/components/Button';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@dailyjs/shared/components/Card';
import Field from '@dailyjs/shared/components/Field';
import { TextInput, BooleanInput } from '@dailyjs/shared/components/Input';
import { Well } from '@dailyjs/shared/components/Well';
import PropTypes from 'prop-types';

/**
 * Intro
 * ---
 * Specify which room we would like to join
 */
export const Intro = ({ room, error, domain, onJoin, fetching = false }) => {
  const [roomName, setRoomName] = useState();
  const [owner, setOwner] = useState(false);
  const [fetchToken, setFetchToken] = useState(false);

  useEffect(() => {
    setRoomName(room);
  }, [room]);

  return (
    <Card>
      <CardHeader>Daily Basic Call Example</CardHeader>
      <CardBody>
        {error && (
          <Well variant="error">
            Failed to obtain token <p>{error}</p>
          </Well>
        )}
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
        <Field label="Fetch meeting token">
          <BooleanInput onChange={(e) => setFetchToken(e.target.checked)} />
        </Field>
        <Field label="Join as owner">
          <BooleanInput onChange={(e) => setOwner(e.target.checked)} />
        </Field>
      </CardBody>
      <CardFooter divider>
        <Button
          onClick={() => onJoin(roomName, owner, fetchToken)}
          disabled={!roomName || fetching}
        >
          {fetching ? 'Fetching token...' : 'Join meeting'}
        </Button>
      </CardFooter>
    </Card>
  );
};

Intro.propTypes = {
  room: PropTypes.string,
  error: PropTypes.string,
  domain: PropTypes.string.isRequired,
  onJoin: PropTypes.func.isRequired,
  fetching: PropTypes.bool,
};

export default Intro;
