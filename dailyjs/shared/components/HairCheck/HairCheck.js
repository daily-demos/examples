import React, { useState, useEffect, useMemo } from 'react';
import Button from '@dailyjs/shared/components/Button';
import { DEVICE_MODAL } from '@dailyjs/shared/components/DeviceSelectModal/DeviceSelectModal';
import { TextInput } from '@dailyjs/shared/components/Input';
import Loader from '@dailyjs/shared/components/Loader';
import { MuteButton } from '@dailyjs/shared/components/MuteButtons';
import { Tile } from '@dailyjs/shared/components/Tile';
import { ACCESS_STATE_LOBBY } from '@dailyjs/shared/constants';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import { useMediaDevices } from '@dailyjs/shared/contexts/MediaDeviceProvider';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import {
  DEVICE_STATE_BLOCKED,
  DEVICE_STATE_NOT_FOUND,
  DEVICE_STATE_IN_USE,
  DEVICE_STATE_PENDING,
  DEVICE_STATE_LOADING,
  DEVICE_STATE_GRANTED,
} from '@dailyjs/shared/contexts/useDevices';
import IconSettings from '@dailyjs/shared/icons/settings-sm.svg';

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
  const { deviceState, camError, micError, isCamMuted, isMicMuted } =
    useMediaDevices();
  const { openModal } = useUIState();
  const [waiting, setWaiting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [denied, setDenied] = useState();
  const [userName, setUserName] = useState('');

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
      } else {
        console.log('❌ Access denied');
        setDenied(true);
      }
    }
  };

  // Memoize the to prevent unnecassary re-renders
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

  const isLoading = useMemo(
    () => deviceState === DEVICE_STATE_LOADING,
    [deviceState]
  );

  const hasError = useMemo(() => {
    if (
      !deviceState ||
      [
        DEVICE_STATE_LOADING,
        DEVICE_STATE_PENDING,
        DEVICE_STATE_GRANTED,
      ].includes(deviceState)
    ) {
      return false;
    }
    return true;
  }, [deviceState]);

  const camErrorVerbose = useMemo(() => {
    switch (camError) {
      case DEVICE_STATE_BLOCKED:
        return 'Camera blocked by user';
      case DEVICE_STATE_NOT_FOUND:
        return 'Camera not found';
      case DEVICE_STATE_IN_USE:
        return 'Device in use';
      default:
        return 'unknown';
    }
  }, [camError]);

  return (
    <>
      <main className="haircheck">
        <img
          src="/images/YARD-2.svg"
          alt="Yard"
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
                    <div className="overlay-message">{micError}</div>
                  )}
                </>
              )}
            </div>
            <div className="mute-buttons">
              <MuteButton isMuted={isCamMuted} />
              <MuteButton mic isMuted={isMicMuted} />
            </div>
            {tileMemo}
          </div>
          <footer>
            {waiting ? (
              <div className="waiting">
                <Loader />
                {denied ? (
                  <span>Call owner denied request</span>
                ) : (
                  <span>Waiting for host to grant access</span>
                )}
              </div>
            ) : (
              <>
                <TextInput
                  placeholder="Enter display name"
                  variant="dark"
                  disabled={joining}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <Button
                  disabled={joining || userName.length < 3}
                  onClick={() => joinCall(userName)}
                >
                  Join call
                </Button>
              </>
            )}
          </footer>
        </div>

        <style jsx>{`
          .haircheck {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 100%;
            background: url('/images/pattern-bg.png') center center no-repeat;
            background-size: 100%;
          }

          .haircheck .panel {
            width: 720px;
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
            max-width: 520px;
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
            padding: var(--spacing-sm);
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs);
          }

          .haircheck .content :global(.device-button) {
            position: absolute;
            top: var(--spacing-sm);
            right: var(--spacing-sm);
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
            max-width: 520px;
            margin: 0 auto;
            border-radius: 0 0 var(--radius-md) var(--radius-md);
            padding: calc(6px + var(--spacing-md)) var(--spacing-sm)
              var(--spacing-md) var(--spacing-sm);
            border-top: 0px;

            display: grid;
            grid-template-columns: 1fr auto;
            grid-column-gap: var(--spacing-sm);
          }

          .waiting {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .waiting span {
            margin-left: var(--spacing-xxs);
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
