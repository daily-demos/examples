/**
 * Call Machine hook
 * --
 * Manages the overaching state of a Daily call, including
 * error handling, preAuth, joining, leaving etc.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';

import {
  ACCESS_STATE_LOBBY,
  ACCESS_STATE_NONE,
  ACCESS_STATE_UNKNOWN,
  MEETING_STATE_JOINED,
} from '../constants';

export const CALL_STATE_READY = 'ready';
export const CALL_STATE_LOBBY = 'lobby';
export const CALL_STATE_JOINING = 'joining';
export const CALL_STATE_JOINED = 'joined';
export const CALL_STATE_ENDED = 'ended';
export const CALL_STATE_ERROR = 'error';
export const CALL_STATE_FULL = 'full';
export const CALL_STATE_EXPIRED = 'expired';
export const CALL_STATE_NOT_BEFORE = 'nbf';
export const CALL_STATE_REMOVED = 'removed-from-call';
export const CALL_STATE_REDIRECTING = 'redirecting';
export const CALL_STATE_NOT_FOUND = 'not-found';
export const CALL_STATE_NOT_ALLOWED = 'not-allowed';
export const CALL_STATE_AWAITING_ARGS = 'awaiting-args';
export const CALL_STATE_NOT_SECURE = 'not-secure';

export const useCallMachine = ({
  domain,
  room,
  token,
  subscribeToTracksAutomatically = true,
}) => {
  const [daily, setDaily] = useState(null);
  const [state, setState] = useState(CALL_STATE_READY);
  const [redirectOnLeave, setRedirectOnLeave] = useState(false);

  const url = useMemo(
    () => (domain && room ? `https://${domain}.daily.co/${room}` : null),
    [domain, room]
  );

  /**
   * Check whether we show the lobby screen, need to knock or
   * can head straight to the call. These parameters are set using
   * `enable_knocking` and `enable_prejoin_ui` when creating the room
   * @param co – Daily call object
   */
  const prejoinUIEnabled = async (co) => {
    const dailyRoomInfo = await co.room();
    const { access } = co.accessState();

    const prejoinEnabled =
      dailyRoomInfo?.config?.enable_prejoin_ui === null
        ? !!dailyRoomInfo?.domainConfig?.enable_prejoin_ui
        : !!dailyRoomInfo?.config?.enable_prejoin_ui;

    const knockingEnabled = !!dailyRoomInfo?.config?.enable_knocking;

    return (
      prejoinEnabled ||
      (access !== ACCESS_STATE_UNKNOWN &&
        access?.level === ACCESS_STATE_LOBBY &&
        knockingEnabled)
    );
  };

  // --- Callbacks ---

  /**
   * Joins call (with the token, if applicable)
   */
  const join = useCallback(
    async (callObject) => {
      setState(CALL_STATE_JOINING);
      const dailyRoomInfo = await callObject.room();

      // Force mute clients when joining a call with experimental_optimize_large_calls enabled.
      if (dailyRoomInfo?.config?.experimental_optimize_large_calls) {
        callObject.setLocalAudio(false);
      }

      await callObject.join({ subscribeToTracksAutomatically, token, url });
      setState(CALL_STATE_JOINED);
    },
    [room, token, subscribeToTracksAutomatically, url]
  );

  /**
   * PreAuth checks whether we have access or need to knock
   */
  const preAuth = useCallback(
    async (co) => {
      const { access } = await co.preAuth({
        subscribeToTracksAutomatically,
        token,
        url,
      });

      // Private room and no `token` was passed
      if (
        access === ACCESS_STATE_UNKNOWN ||
        access?.level === ACCESS_STATE_NONE
      ) {
        return;
      }

      // Either `enable_knocking_ui` or `enable_prejoin_ui` is set to `true`
      if (
        access?.level === ACCESS_STATE_LOBBY ||
        (await prejoinUIEnabled(co))
      ) {
        setState(CALL_STATE_LOBBY);
        return;
      }

      // Public room or private room with passed `token` and `enable_prejoin_ui` is `false`
      join(co);
    },
    [join, subscribeToTracksAutomatically, token, url]
  );

  /**
   * Leave call
   */
  const leave = useCallback(() => {
    if (!daily) return;
    // If we're in the error state, we've already "left", so just clean up
    if (state === CALL_STATE_ERROR) {
      daily.destroy();
    } else {
      daily.leave();
    }
  }, [daily, state]);

  /**
   * Listen for access state updates
   */
  const handleAccessStateUpdated = useCallback(
    async ({ access }) => {
      console.log(`🔑 Access level: ${access?.level}`);

      /**
       * Ignore initial access-state-updated event
       */
      if (
        [CALL_STATE_ENDED, CALL_STATE_AWAITING_ARGS, CALL_STATE_READY].includes(
          state
        )
      ) {
        return;
      }

      if (
        access === ACCESS_STATE_UNKNOWN ||
        access?.level === ACCESS_STATE_NONE
      ) {
        setState(CALL_STATE_NOT_ALLOWED);
        return;
      }

      const meetingState = daily.meetingState();
      if (
        access?.level === ACCESS_STATE_LOBBY &&
        meetingState === MEETING_STATE_JOINED
      ) {
        // Already joined, no need to call join(daily) again.
        return;
      }

      /**
       * 'full' access, we can now join the meeting.
       */
      join(daily);
    },
    [daily, state, join]
  );

  // --- Effects ---

  /**
   * Instantiate the call object and preauthenticate
   */
  useEffect(() => {
    if (daily || !url || state !== CALL_STATE_READY) return;

    if (
      location.protocol !== 'https:' &&
      // We want to still allow local development.
      !['localhost'].includes(location.hostname)
    ) {
      setState('not-secure');
      return;
    }

    console.log('🚀 Creating call object');

    const co = DailyIframe.createCallObject({
      url,
      dailyConfig: {
        experimentalChromeVideoMuteLightOff: true,
        useDevicePreferenceCookies: true,
      },
    });

    setDaily(co);
    preAuth(co);
  }, [daily, url, state, preAuth]);

  /**
   * Listen for changes in the participant's access state
   */
  useEffect(() => {
    if (!daily) return;

    daily.on('access-state-updated', handleAccessStateUpdated);
    return () => daily.off('access-state-updated', handleAccessStateUpdated);
  }, [daily, handleAccessStateUpdated]);

  /**
   * Listen for and manage call state
   */
  useEffect(() => {
    if (!daily) return false;

    const events = [
      'joined-meeting',
      'joining-meeting',
      'left-meeting',
      'error',
    ];

    const handleMeetingState = async (ev) => {
      const { access } = daily.accessState();

      switch (ev.action) {
        /**
         * Don't transition to 'joining' or 'joined' UI as long as access is not 'full'.
         * This means a request to join a private room is not granted, yet.
         * Technically in requesting for access, the participant is already known
         * to the room, but not joined, yet.
         */
        case 'joining-meeting':
          if (
            access === ACCESS_STATE_UNKNOWN ||
            access.level === ACCESS_STATE_NONE ||
            access.level === ACCESS_STATE_LOBBY
          ) {
            return;
          }
          setState(CALL_STATE_JOINING);
          break;
        case 'joined-meeting':
          if (
            access === ACCESS_STATE_UNKNOWN ||
            access.level === ACCESS_STATE_NONE ||
            access.level === ACCESS_STATE_LOBBY
          ) {
            return;
          }
          setState(CALL_STATE_JOINED);
          break;
        case 'left-meeting':
          daily.destroy();
          setState(
            !redirectOnLeave ? CALL_STATE_ENDED : CALL_STATE_REDIRECTING
          );
          break;
        case 'error':
          switch (ev?.error?.type) {
            case 'nbf-room':
            case 'nbf-token':
              daily.destroy();
              setState(CALL_STATE_NOT_BEFORE);
              break;
            case 'exp-room':
            case 'exp-token':
              daily.destroy();
              setState(CALL_STATE_EXPIRED);
              break;
            case 'ejected':
              daily.destroy();
              setState(CALL_STATE_REMOVED);
              break;
            default:
              switch (ev?.errorMsg) {
                case 'Join request rejected':
                  // Join request to a private room was denied. We can end here.
                  setState(CALL_STATE_LOBBY);
                  daily.leave();
                  break;
                case 'Meeting has ended':
                  // Meeting has ended or participant was removed by an owner.
                  daily.destroy();
                  setState(CALL_STATE_ENDED);
                  break;
                case 'Meeting is full':
                  daily.destroy();
                  setState(CALL_STATE_FULL);
                  break;
                case "The meeting you're trying to join does not exist.":
                  daily.destroy();
                  setState(CALL_STATE_NOT_FOUND);
                  break;
                case 'You are not allowed to join this meeting':
                  daily.destroy();
                  setState(CALL_STATE_NOT_ALLOWED);
                  break;
                default:
                  setState(CALL_STATE_ERROR);
                  break;
              }
              break;
          }
          break;
        default:
          break;
      }
    };

    // Listen for changes in state
    events.forEach((event) => daily.on(event, handleMeetingState));

    // Stop listening for changes in state
    return () =>
      events.forEach((event) => daily.off(event, handleMeetingState));
  }, [daily, domain, room, redirectOnLeave]);

  return {
    daily,
    leave,
    setRedirectOnLeave,
    state: useMemo(() => state, [state]),
  };
};
