import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDaily, useDevices } from '@daily-co/daily-react-hooks';
import Bowser from 'bowser';
import PropTypes from 'prop-types';

import { isIOSMobile, isSafari } from '../lib/browserConfig';
import { useCallState } from './CallProvider';
import { useUIState } from './UIStateProvider';

const noop = () => {};

const REREQUEST_INTERVAL = 2000;

export const MediaDeviceContext = createContext({
  promptForAccess: noop,
});

export const MediaDeviceProvider = ({ children }) => {
  const daily = useDaily();
  const { state } = useCallState();
  const {
    setShowDeviceInUseModal,
    setShowDeviceNotFoundModal,
    setShowUnblockPermissionsModal,
  } = useUIState();
  const [browserState, setBrowserState] = useState('');

  const { camState, micState, refreshDevices } = useDevices();

  useEffect(() => setBrowserState(Bowser(navigator.userAgent)), []);

  /**
   * Clean up modals, when errors are resolved.
   */
  useEffect(() => {
    if (camState !== 'blocked' && micState !== 'blocked') {
      setShowUnblockPermissionsModal(false);
    }
    if (camState !== 'in-use' && micState !== 'in-use') {
      setShowDeviceInUseModal(false);
    }
    if (camState !== 'not-found' && micState !== 'not-found') {
      setShowDeviceNotFoundModal(false);
    }
  }, [
    camState,
    micState,
    setShowDeviceInUseModal,
    setShowDeviceNotFoundModal,
    setShowUnblockPermissionsModal,
  ]);

  /**
   * Automatically show modal when selected device is in use.
   */
  useEffect(() => {
    if (state !== 'joined' || camState !== 'in-use') return;
    setShowDeviceInUseModal(true);
  }, [camState, setShowDeviceInUseModal, state]);

  const promptForAccess = useCallback(() => {
    if (isSafari() || isIOSMobile()) {
      if (!isIOSMobile() || isSafari(14)) {
        let openModal = true;
        const openTimeout = setTimeout(() => {
          openModal = false;
        }, 1500);
        daily.once('camera-error', () => {
          if (openModal) {
            setShowUnblockPermissionsModal(true);
            clearTimeout(openTimeout);
          }
        });
      }
      daily.setLocalVideo(true);
      daily.setLocalAudio(true);
    } else {
      setShowUnblockPermissionsModal(true);
    }
  }, [daily, setShowUnblockPermissionsModal]);

  const browser = useMemo(() => browserState, [browserState]);

  /**
   * Automatically re-request cam access.
   */
  useEffect(() => {
    if (!daily) return;

    let interval;
    switch (camState) {
      case 'in-use':
        if (browser?.browser?.name === 'Firefox') return;
        break;
      case 'blocked':
        if (isSafari() || isIOSMobile()) return;
        interval = setInterval(() => {
          try {
            daily.setLocalVideo(true);
            daily.setLocalAudio(true);
          } catch {}
        }, REREQUEST_INTERVAL);
        break;
      default:
        refreshDevices();
        break;
    }
    return () => {
      clearInterval(interval);
    };
  }, [browser, camState, daily, refreshDevices]);

  return (
    <MediaDeviceContext.Provider
      value={{
        promptForAccess,
      }}
    >
      {children}
    </MediaDeviceContext.Provider>
  );
};

MediaDeviceProvider.propTypes = {
  children: PropTypes.node,
};
MediaDeviceProvider.defaultProps = {
  children: null,
};

export const useMediaDevices = () => useContext(MediaDeviceContext);
