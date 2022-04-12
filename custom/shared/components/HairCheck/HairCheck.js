import React, { useState, useEffect, useMemo } from 'react';
import Button from '@custom/shared/components/Button';
import { DEVICE_MODAL } from '@custom/shared/components/DeviceSelectModal/DeviceSelectModal';
import { TextInput } from '@custom/shared/components/Input';
import Loader from '@custom/shared/components/Loader';
import MuteButton from '@custom/shared/components/MuteButton';
import Tile from '@custom/shared/components/Tile';
import { ACCESS_STATE_LOBBY } from '@custom/shared/constants';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import {
  DEVICE_STATE_BLOCKED,
  DEVICE_STATE_NOT_FOUND,
  DEVICE_STATE_IN_USE,
  DEVICE_STATE_PENDING,
  useMediaDevices,
} from '@custom/shared/contexts/MediaDeviceProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import IconSettings from '@custom/shared/icons/settings-sm.svg';

import { useDeepCompareMemo } from 'use-deep-compare';

/**
 * Hair check
 * ---
 * - Setup local media devices to see how you look / sound
 * - Toggle mute state of camera and mic
 * - Set user name and join call / request access
 */
export const HairCheck = () => {
  const { callObject } = useCallState();
  const { localParticipant } = useParticipants();
  const {
    camState,
    micState,
    camError,
    micError,
    isCamMuted,
    isMicMuted,
  } = useMediaDevices();
  const { openModal } = useUIState();
  const [waiting, setWaiting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [denied, setDenied] = useState();
  const [userName, setUserName] = useState(
    localStorage.getItem('PLUOT_PARTICIPANT_NAME') || ''
  );

  // Initialise devices (even though we're not yet in a call)
  useEffect(() => {
    if (!callObject) return;
    callObject.startCamera();
  }, [callObject]);

  const joinCall = async () => {
    if (!callObject) return;

    // Disable join controls
    setJoining(true);

    // Set the local participants name
    await callObject.setUserName(userName);

    // Async request access (this will block until the call owner responds to the knock)
    const { access } = callObject.accessState();
    await callObject.join();

    // If we we're in the lobby, wait for the owner to let us in
    if (access?.level === ACCESS_STATE_LOBBY) {
      setWaiting(true);
      const { granted } = await callObject.requestAccess({
        name: userName,
        access: {
          level: 'full',
        },
      });

      if (granted) {
        // Note: we don't have to do any thing here as the call state will mutate
        console.log('👋 Access granted');
        localStorage.setItem('PLUOT_PARTICIPANT_NAME', userName);
      } else {
        console.log('❌ Access denied');
        setDenied(true);
      }
    }
  };

  // Memoize the to prevent unnecessary re-renders
  const tileMemo = useDeepCompareMemo(
    () => (
      <Tile
        participant={localParticipant}
        mirrored
        showAvatar
        showName={false}
      />
    ),
    [localParticipant]
  );

  const isLoading = useMemo(() => camState === DEVICE_STATE_PENDING || micState === DEVICE_STATE_PENDING, [
    camState, micState,
  ]);

  const hasError = useMemo(() => camError || micError, [camError, micError]);

  const camErrorVerbose = useMemo(() => {
    switch (camState) {
      case DEVICE_STATE_BLOCKED:
        return 'Camera blocked by user';
      case DEVICE_STATE_NOT_FOUND:
        return 'Camera not found';
      case DEVICE_STATE_IN_USE:
        return 'Device in use';
      default:
        return 'unknown';
    }
  }, [camState]);

  const micErrorVerbose = useMemo(() => {
    switch (micState) {
      case DEVICE_STATE_BLOCKED:
        return 'Microphone blocked by user';
      case DEVICE_STATE_NOT_FOUND:
        return 'Microphone not found';
      case DEVICE_STATE_IN_USE:
        return 'Microphone in use';
      default:
        return 'unknown';
    }
  }, [micState]);

  const showWaitingMessage = useMemo(() => {
    return (
      <div className="waiting">
        <Loader />
        {denied ? (
          <span>Call owner denied request</span>
        ) : (
          <span>Waiting for host to grant access</span>
        )}
        <style jsx>{`
          .waiting {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .waiting span {
            margin-left: var(--spacing-xxs);
          }
        `}</style>
      </div>
    );
  }, [denied]);

  const showUsernameInput = useMemo(() => {
    return (
      <>
        <TextInput
          placeholder="Enter display name"
          variant="dark"
          disabled={joining}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <Button
          disabled={joining || userName.length < 3}
          type="submit"
        >
          Join call
        </Button>
      </>
    );
  }, [userName, joining, setUserName]);

  return (
    <>
      <main className="haircheck">
        <img
          src="/assets/daily-logo.svg"
          alt="Daily.co"
          width="132"
          height="58"
          className="logo"
        />
        <div className="panel">
          <header>
            <h2>Ready to join?</h2>
          </header>
          <div className="tile-container">
            <div className="content">
              <Button
                className="device-button"
                size="medium-square"
                variant="blur"
                onClick={() => openModal(DEVICE_MODAL)}
              >
                <IconSettings />
              </Button>

              {isLoading && (
                <div className="overlay-message">
                  Loading devices, please wait...
                </div>
              )}
              {hasError && (
                <>
                  {camError && (
                    <div className="overlay-message">{camErrorVerbose}</div>
                  )}
                  {micError && (
                    <div className="overlay-message">{micErrorVerbose}</div>
                  )}
                </>
              )}
            </div>
            <div className="mute-buttons">
              <MuteButton isMuted={isCamMuted} disabled={camError} />
              <MuteButton mic isMuted={isMicMuted} disabled={micError} />
            </div>
            {tileMemo}
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            joinCall(userName);
          }}>
            <footer>{waiting ? showWaitingMessage : showUsernameInput}</footer>
          </form>
        </div>

        <style jsx>{`
          .haircheck {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 100%;
            background: url('/assets/pattern-bg.png') center center no-repeat;
            background-size: 100%;
          }

          .haircheck .panel {
            width: 580px;
            text-align: center;
          }

          .haircheck .tile-container {
            border-radius: var(--radius-md);
            -webkit-mask-image: -webkit-radial-gradient(white, black);
            overflow: hidden;
            position: relative;
          }

          .haircheck header {
            position: relative;
            color: white;
            border: 3px solid rgba(255, 255, 255, 0.1);
            max-width: 480px;
            margin: 0 auto;
            border-radius: var(--radius-md) var(--radius-md) 0 0;
            border-bottom: 0px;
            padding: var(--spacing-md) 0 calc(6px + var(--spacing-md)) 0;
          }

          .haircheck header:before,
          .haircheck footer:before {
            content: '';
            position: absolute;
            height: 6px;
            left: var(--spacing-sm);
            right: var(--spacing-sm);
            background: linear-gradient(
              90deg,
              var(--primary-default) 0%,
              var(--secondary-dark) 100%
            );
            border-radius: 6px 6px 0px 0px;
            bottom: 0px;
          }

          .haircheck footer:before {
            top: 0px;
            bottom: auto;
            border-radius: 0px 0px 6px 6px;
          }

          .haircheck header h2 {
            margin: 0px;
          }

          .haircheck .content {
            position: absolute;
            top: 0px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99;
          }

          .haircheck .mute-buttons {
            position: absolute;
            bottom: 0px;
            left: 0px;
            right: 0px;
            z-index: 99;
            padding: var(--spacing-xs);
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs);
          }

          .haircheck .content :global(.device-button) {
            position: absolute;
            top: var(--spacing-xxs);
            right: var(--spacing-xxs);
          }

          .haircheck .overlay-message {
            color: var(--reverse);
            padding: var(--spacing-xxs) var(--spacing-xs);
            background: rgba(0, 0, 0, 0.35);
            border-radius: var(--radius-sm);
          }

          .haircheck footer {
            position: relative;
            border: 3px solid rgba(255, 255, 255, 0.1);
            max-width: 480px;
            margin: 0 auto;
            border-radius: 0 0 var(--radius-md) var(--radius-md);
            padding: calc(6px + var(--spacing-md)) var(--spacing-sm)
              var(--spacing-md) var(--spacing-sm);
            border-top: 0px;

            display: grid;
            grid-template-columns: 1fr auto;
            grid-column-gap: var(--spacing-xs);
          }

          .logo {
            position: absolute;
            top: var(--spacing-sm);
            left: var(--spacing-sm);
          }
        `}</style>
      </main>
    </>
  );
};

export default HairCheck;
