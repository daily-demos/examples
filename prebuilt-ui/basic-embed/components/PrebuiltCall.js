import DailyIframe from '@daily-co/daily-js';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { writeText } from 'clipboard-polyfill';
import { Button } from '@dailyjs/shared/components/Button';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@dailyjs/shared/components/Card';
import Field from '@dailyjs/shared/components/Field';
import { TextInput } from '@dailyjs/shared/components/Input';
import { Well } from '@dailyjs/shared/components/Well';
import getDemoProps from '@dailyjs/shared/lib/demoProps';
import { Header } from '../components/Header';

export default function PrebuiltCall() {
  const [demoState, setDemoState] = useState('home');
  const [isError, setIsError] = useState(false);
  const [roomURL, setRoomURL] = useState('');
  const [exp, setExp] = useState();
  const [secs, setSecs] = useState();
  const [roomValidity, setRoomValidity] = useState(false);
  const roomURLRef = useRef(null);
  const iframeRef = useRef(null);
  const callFrame = useRef(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Updates the time left that displays in the UI
  useEffect(() => {
    if (!exp) {
      return false;
    }
    const i = setInterval(() => {
      const timeLeft = Math.floor((new Date(exp * 1000) - Date.now()) / 1000);
      setSecs(`${Math.floor(timeLeft / 60)}:${`0${timeLeft % 60}`.slice(-2)}`);
    }, 1000);
    return () => clearInterval(i);
  }, [exp]);

  // Listens for a "call" demo state, and creates then joins a callFrame as soon as that happens
  useEffect(() => {
    if (!iframeRef?.current || demoState !== 'call') {
      return;
    }
    try {
      callFrame.current = DailyIframe.createFrame(iframeRef.current, {
        showLeaveButton: true,
        iframeStyle: {
          height: '100%',
          width: '100%',
          aspectRatio: 16 / 9,
          minwidth: '400px',
          maxWidth: '920px',
          border: '0',
          borderRadius: '12px',
        },
      });
      callFrame.current.join({
        url: roomURL,
      });
    } catch (e) {
      setDemoState('home');
      setIsError(true);
      return;
    }

    const handleLeftMeeting = () => {
      setDemoState('home');
      setRoomValidity(false);
      callFrame.current.destroy();
    };

    callFrame.current.on('left-meeting', handleLeftMeeting);
  }, [demoState, iframeRef, roomURL]);

  const createRoom = useCallback(
    async (e) => {
      if (!roomURLRef?.current.value) {
        const roomExp = Math.round(Date.now() / 1000) + 60 * 5;
        try {
          const res = await fetch('/api/room', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              properties: {
                roomExp,
              },
            }),
          });
          const roomJson = await res.json();
          const { url } = roomJson;
          setRoomURL(url);
          setDemoState('call');
          setExp(roomExp);
          setIsError(false);
        } catch (e) {
          setDemoState('home');
          setIsError(true);
        }
      }
    },
    [roomURL, exp]
  );

  // Updates state if a room is provided
  const handleRoomInput = useCallback(
    (e) => {
      setRoomURL(e?.target?.value);
      if (e?.target?.checkValidity()) {
        setRoomValidity(true);
        console.log(roomValidity);
      }
    },
    [roomValidity]
  );

  const submitJoinRoom = useCallback(() => {
    setDemoState('call');
  });

  const handleCopyClick = useCallback(() => {
    console.log('click');
    writeText(roomURL);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 5000);
  }, [roomURL, linkCopied]);

  const content = useMemo(() => {
    switch (demoState) {
      case 'home':
        return (
          <Card>
            <CardHeader>
              Start demo with a new unique room, or paste in your own room URL.
            </CardHeader>
            <CardBody>
              {isError && (
                <Well variant="error">
                  Error creating the room. Please try again.
                </Well>
              )}
              <Button onClick={() => createRoom()} disabled={roomValidity}>
                Create room and start
              </Button>
              <Field label="Or enter room to join" className="roomField">
                <TextInput
                  ref={roomURLRef}
                  type="text"
                  placeholder="Enter room URL..."
                  pattern="^(https:\/\/)?[\w.-]+(\.(daily\.(co)))+[\/\/]+[\w.-]+$"
                  onChange={handleRoomInput}
                />
              </Field>
              <CardFooter>
                <Button
                  onClick={() => submitJoinRoom()}
                  disabled={!roomValidity}
                >
                  Join room
                </Button>
              </CardFooter>
            </CardBody>
          </Card>
        );
      case 'call':
        return (
          <>
            <div ref={iframeRef} className="call" />
            <Card>
              <CardHeader>Copy and share the URL to invite others.</CardHeader>
              <CardBody>
                <label for="copy-url"></label>
                <TextInput
                  type="text"
                  class="url-input"
                  id="copy-url"
                  placeholder="Copy this room URL"
                  value={roomURL}
                  pattern="^(https:\/\/)?[\w.-]+(\.(daily\.(co)))+[\/\/]+[\w.-]+$"
                />
                <Button onClick={handleCopyClick}>
                  {linkCopied ? 'Copied!' : `Copy room URL`}
                </Button>
                {exp && (
                  <h3>
                    This room expires in:{' '}
                    <span className="countdown">{secs}</span>
                  </h3>
                )}
              </CardBody>
            </Card>
          </>
        );
    }
  }, [demoState, roomValidity, roomURLRef, exp, secs]);

  return (
    <div className="container">
      <Header />
      {content}
      <style jsx>{`
        .container {
          display: flex;
          align-items: center;
          justify-content: space-around;
          width: 100%;
          height: 100%;
          position: absolute;
        }

        .container :global(.call) {
          height: 70%;
        }

        .container :global(.countdown) {
          padding: 4px 0;
          font-size: 1rem;
          font-weight: var(--weight-medium);
          border-radius: 0 0 0 var(--radius-sm);
          color: var(--blue-dark);
        }

        :global(.field) {
          margin-top: var(--spacing-sm);
        }

        :global(.card) {
          margin: 8px;
        }

        @media only screen and (max-width: 750px) {
          .container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export async function getStaticProps() {
  const defaultProps = getDemoProps();

  return {
    props: defaultProps,
  };
}
