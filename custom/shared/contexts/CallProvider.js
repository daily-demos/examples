/**
 * Call Provider / Context
 * ---
 * Configures the general state of a Daily call, such as which features
 * to enable, as well as instantiate the 'call machine' hook responsible
 * for the overaching call loop (joining, leaving, etc)
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import Bowser from 'bowser';
import PropTypes from 'prop-types';
import {
  ACCESS_STATE_LOBBY,
  ACCESS_STATE_UNKNOWN,
  VIDEO_QUALITY_AUTO,
} from '../constants';
import { useNetworkState } from '../hooks/useNetworkState';
import { useCallMachine } from './useCallMachine';

export const CallContext = createContext();

export const CallProvider = ({
  children,
  domain,
  room,
  token = '',
  subscribeToTracksAutomatically = true,
}) => {
  const [roomInfo, setRoomInfo] = useState(null);
  const [videoQuality, setVideoQuality] = useState(VIDEO_QUALITY_AUTO);
  const [showLocalVideo, setShowLocalVideo] = useState(true);
  const [preJoinNonAuthorized, setPreJoinNonAuthorized] = useState(false);
  const [enableRecording, setEnableRecording] = useState(null);
  const [startCloudRecording, setStartCloudRecording] = useState(false);
  const [roomExp, setRoomExp] = useState(null);

  // Daily CallMachine hook (primarily handles status of the call)
  const { daily, leave, state, setRedirectOnLeave } = useCallMachine({
    domain,
    room,
    token,
    subscribeToTracksAutomatically,
  });
  const networkState = useNetworkState(daily, videoQuality);

  // Feature detection taken from daily room object and client browser support
  useEffect(() => {
    if (!daily) return;
    const updateRoomConfigState = async () => {
      const roomConfig = await daily.room();
      setRoomInfo(roomConfig);
      const config = roomConfig?.config;
      if (!config) return;

      if (config.exp) {
        setRoomExp(config.exp * 1000 || Date.now() + 1 * 60 * 1000);
      }
      const browser = Bowser.parse(window.navigator.userAgent);
      const recordingType =
        roomConfig?.tokenConfig?.enable_recording ??
        roomConfig?.config?.enable_recording;

      // Mobile and Safari recordings are only supported under the 'cloud-beta' type
      const supportsRecording =
        ((browser.platform.type !== 'desktop' ||
          browser.engine.name !== 'Blink') &&
          recordingType === 'cloud-beta') ||
        (browser.platform.type === 'desktop' &&
          browser.engine.name === 'Blink');
      if (supportsRecording) {
        setEnableRecording(recordingType);
        setStartCloudRecording(
          roomConfig?.tokenConfig?.start_cloud_recording ?? false
        );
      }
    };
    updateRoomConfigState();
  }, [state, daily]);

  // Convience wrapper for adding a fake participant to the call
  const addFakeParticipant = useCallback(() => {
    daily.addFakeParticipant();
  }, [daily]);

  // Convenience wrapper for changing the bandwidth of the client
  const setBandwidth = useCallback(
    (quality) => {
      daily.setBandwidth(quality);
    },
    [daily]
  );

  useEffect(() => {
    if (!daily) return;

    const { access } = daily.accessState();
    if (access === ACCESS_STATE_UNKNOWN) return;

    const requiresPermission = access?.level === ACCESS_STATE_LOBBY;
    setPreJoinNonAuthorized(requiresPermission && !token);
  }, [state, daily, token]);

  return (
    <CallContext.Provider
      value={{
        state,
        callObject: daily,
        addFakeParticipant,
        preJoinNonAuthorized,
        leave,
        networkState,
        showLocalVideo,
        roomExp,
        enableRecording,
        videoQuality,
        setVideoQuality,
        roomInfo,
        setRoomInfo,
        setBandwidth,
        setRedirectOnLeave,
        setShowLocalVideo,
        startCloudRecording,
        subscribeToTracksAutomatically,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

CallProvider.propTypes = {
  children: PropTypes.node,
  domain: PropTypes.string.isRequired,
  room: PropTypes.string.isRequired,
  token: PropTypes.string,
  subscribeToTracksAutomatically: PropTypes.bool,
};

export const useCallState = () => useContext(CallContext);
