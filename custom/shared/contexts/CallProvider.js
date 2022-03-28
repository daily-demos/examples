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
import { DailyProvider } from '@daily-co/daily-react-hooks';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import {
  ACCESS_STATE_LOBBY,
  ACCESS_STATE_UNKNOWN,
  VIDEO_QUALITY_AUTO,
} from '../constants';
import { useCallMachine } from './useCallMachine';

export const CallContext = createContext();

export const CallProvider = ({
  children,
  domain,
  room,
  token = '',
  subscribeToTracksAutomatically = true,
  cleanURLOnJoin = false,
}) => {
  const router = useRouter();
  const [enableJoinSound, setEnableJoinSound] = useState(true);
  const [videoQuality, setVideoQuality] = useState(VIDEO_QUALITY_AUTO);
  const [preJoinNonAuthorized, setPreJoinNonAuthorized] = useState(false);
  const [showNames, setShowNames] = useState(true);

  // Daily CallMachine hook (primarily handles status of the call)
  const { daily, disableAudio, leave, state, setRedirectOnLeave } =
    useCallMachine({
      domain,
      room,
      token,
      subscribeToTracksAutomatically,
    });

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

  useEffect(() => {
    if (!daily) return;

    if (cleanURLOnJoin)
      daily.on('joined-meeting', () => router.replace(`/${room}`));

    return () => daily.off('joined-meeting', () => router.replace(`/${room}`));
  }, [cleanURLOnJoin, daily, room, router]);

  return (
    <CallContext.Provider
      value={{
        state,
        callObject: daily,
        addFakeParticipant,
        preJoinNonAuthorized,
        leave,
        enableJoinSound,
        videoQuality,
        setVideoQuality,
        setBandwidth,
        setRedirectOnLeave,
        subscribeToTracksAutomatically,
        setEnableJoinSound,
        disableAudio,
        showNames,
        setShowNames,
      }}
    >
      <DailyProvider callObject={daily}>{children}</DailyProvider>
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
