import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '@custom/shared/components/Button';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
} from '@custom/shared/components/Card';
import { TextInput } from '@custom/shared/components/Input';
import DailyIframe from '@daily-co/daily-js';
import { writeText } from 'clipboard-polyfill';
import ExpiryTimer from '../components/ExpiryTimer';

const CALL_OPTIONS = {
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
};

export function Call({ room, setRoom, callFrame, setCallFrame, expiry }) {
  const callRef = useRef(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const handleCopyClick = useCallback(() => {
    writeText(room);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 5000);
  }, [room, isLinkCopied]);

  const createAndJoinCall = useCallback(() => {
    const newCallFrame = DailyIframe.createFrame(
      callRef?.current,
      CALL_OPTIONS
    );

    setCallFrame(newCallFrame);

    newCallFrame.join({ url: room });

    const leaveCall = () => {
      setRoom(null);
      setCallFrame(null);
      callFrame.destroy();
    };

    newCallFrame.on('left-meeting', leaveCall);
  }, [room, setCallFrame]);

  /**
   * Initiate Daily iframe creation on component render if it doesn't already exist
   */
  useEffect(() => {
    if (callFrame) return;

    createAndJoinCall();
  }, [callFrame, createAndJoinCall]);

  return (
    <div>
      <div className="call-container">
        {/* Daily iframe container */}
        <div ref={callRef} className="call" />
        <Card>
          <CardHeader>Copy and share the URL to invite others</CardHeader>
          <CardBody>
            <label htmlFor="copy-url"></label>
            <TextInput
              type="text"
              id="copy-url"
              placeholder="Copy this room URL"
              value={room}
              pattern="^(https:\/\/)?[\w.-]+(\.(daily\.(co)))+[\/\/]+[\w.-]+$"
            />
            <Button onClick={handleCopyClick}>
              {isLinkCopied ? 'Copied!' : `Copy room URL`}
            </Button>
          </CardBody>
          <CardFooter>
            {expiry && (
              <CardFooter>
                Room expires in:
                <ExpiryTimer expiry={expiry} />
              </CardFooter>
            )}
          </CardFooter>
        </Card>
        <style jsx>{`
          .call-container {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
          }
          .call-container :global(.call) {
            width: 100%;
          }
          .call-container :global(.button) {
            margin-top: var(--spacing-md);
          }
          .call-container :global(.card) {
            max-width: 300px;
            max-height: 400px;
          }
          .call-container :global(.card-footer) {
            align-items: center;
            gap: var(--spacing-xxs);
          }
          .call-container :global(.countdown) {
            position: static;
            border-radius: var(--radius-sm);
          }
          @media only screen and (max-width: 750px) {
            .call-container {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Call;
