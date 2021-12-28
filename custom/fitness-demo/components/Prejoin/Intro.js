import React, { useEffect, useState } from 'react';
import Button from '@custom/shared/components/Button';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@custom/shared/components/Card';
import Field from '@custom/shared/components/Field';
import { TextInput, BooleanInput, SelectInput } from '@custom/shared/components/Input';
import Well from '@custom/shared/components/Well';
import PropTypes from 'prop-types';

/**
 * Intro
 * ---
 * Specify which room we would like to join
 */
export const Intro = ({
  room,
  error,
  onJoin,
}) => {
  const [rooms, setRooms] = useState({});
  const [duration, setDuration] = useState("30");
  const [roomName, setRoomName] = useState();
  const [privacy, setPrivacy] = useState(false);

  const fetchRooms = async () => {
    const res = await fetch('/api/presence', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const resJson = await res.json();
    setRooms(resJson);
  }

  useEffect(() => {
    fetchRooms();
    const i = setInterval(fetchRooms, 15000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    setRoomName(room);
  }, [room]);

  return (
    <div className="intro">
      <Card>
        <div className="jc-card">
          <CardHeader>Join a class</CardHeader>
          <CardBody>
            {Object.keys(rooms).length === 0 && (
              <p>
                Looks like there&apos;s no class going on right now,
                start with creating one!
              </p>
            )}
            {Object.keys(rooms).map(room => (
              <div className="room" key={room}>
                <div>
                  <div className="label">{room}</div>
                  <span>{`${rooms[room].length} people in class`}</span>
                </div>
                <div className="join-room">
                  <Button variant="dark" size="tiny" onClick={() => onJoin(room, 'join')}>
                    Join Room
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </div>
      </Card>
      <span className="or-text">OR</span>
      <Card>
        <div className="jc-card">
          <CardHeader>Create a class</CardHeader>
          <CardBody>
            {error && (
              <Well variant="error">
                Failed to create room <p>{error}</p>
              </Well>
            )}
            <Field label="Give you a class name">
              <TextInput
                type="text"
                placeholder="Eg. super-stretch"
                defaultValue={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
            </Field>
            <Field label="How long would you like to be?">
              <SelectInput
                onChange={(e) => setDuration(e.target.value)}
                value={duration}>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
              </SelectInput>
            </Field>
            <Field label="Public (anyone can join)">
              <BooleanInput value={privacy} onChange={e => setPrivacy(e.target.checked)} />
            </Field>
          </CardBody>
          <CardFooter divider>
            <Button
              fullWidth
              onClick={() => onJoin(roomName, 'create', duration, privacy)}
            >
              Create class
            </Button>
          </CardFooter>
        </div>
      </Card>
      <style jsx>{`
        .intro {
          display: flex;
          gap: 15px;
          margin: auto;
        }
        .or-text {
          color: var(--reverse);
          margin: auto;
        }
        .room {
          display: flex;
          width: 25vw;
          border-bottom: 1px solid var(--gray-light);
          padding-bottom: var(--spacing-xxs);
          gap: 10px;
        }
        .room .label {
          font-weight: var(--weight-medium);
          color: var(--text-default);
        }
        .room .join-room {
          margin-left: auto;
          margin-bottom: auto;
          margin-top: auto;
        }
        .jc-card {
          width: 25vw;
        }
      `}
      </style>
    </div>
  );
};

Intro.propTypes = {
  room: PropTypes.string,
  onJoin: PropTypes.func.isRequired,
};

export default Intro;
