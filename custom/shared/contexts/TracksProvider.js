import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { sortByKey } from '@custom/shared/lib/sortByKey';
import deepEqual from 'fast-deep-equal';
import { useDeepCompareCallback } from 'use-deep-compare';

import { useCallState } from './CallProvider';
import { useParticipants } from './ParticipantsProvider';
import { useUIState } from './UIStateProvider';
import { getScreenId, isLocalId, isScreenId } from './participantsState';
import { initialTracksState, tracksReducer } from './tracksState';

/**
 * Maximum amount of concurrently subscribed or staged most recent speakers.
 */
export const MAX_RECENT_SPEAKER_COUNT = 8;
/**
 * Threshold up to which all cams will be subscribed to or staged.
 * If the remote participant count passes this threshold,
 * cam subscriptions are defined by UI view modes.
 */
const SUBSCRIBE_OR_STAGE_ALL_VIDEO_THRESHOLD = 9;

const TracksContext = createContext(null);

export const TracksProvider = ({ children }) => {
  const { callObject: daily, optimizeLargeCalls, subscribeToTracksAutomatically } = useCallState();
  const { participants } = useParticipants();
  const { viewMode } = useUIState();
  const [state, dispatch] = useReducer(tracksReducer, initialTracksState);
  const [maxCamSubscriptions, setMaxCamSubscriptions] = useState(null);

  const recentSpeakerIds = useMemo(
    () =>
      participants
        .filter((p) => Boolean(p.lastActiveDate))
        .sort(sortByKey('lastActiveDate'))
        .slice(-MAX_RECENT_SPEAKER_COUNT)
        .map((p) => p.id)
        .reverse(),
    [participants]
  );

  const remoteParticipantIds = useMemo(
    () => participants.filter((p) => !p.isLocal).map((p) => p.id),
    [participants]
  );

  const subscribeToCam = useCallback(
    (id) => {
      /**
       * Ignore undefined, local or screenshare.
       */
      if (!id || isLocalId(id) || isScreenId(id)) return;
      daily.updateParticipant(id, {
        setSubscribedTracks: { video: true },
      });
    },
    [daily]
  );

  /**
   * Updates cam subscriptions based on passed subscribedIds and stagedIds.
   * For ids not provided, cam tracks will be unsubscribed from.
   *
   * @param subscribedIds Participant ids whose cam tracks should be subscribed to.
   * @param stagedIds Participant ids whose cam tracks should be staged.
   */
  const updateCamSubscriptions = useCallback(
    (subscribedIds, stagedIds = []) => {
      if (!daily) return;

      // If total number of remote participants is less than a threshold, simply
      // stage all remote cams that aren't already marked for subscription.
      // Otherwise, honor the provided stagedIds, with recent speakers appended
      // who aren't already marked for subscription.
      if (
        remoteParticipantIds.length <= SUBSCRIBE_OR_STAGE_ALL_VIDEO_THRESHOLD
      ) {
        stagedIds = remoteParticipantIds.filter(
          (id) => !subscribedIds.includes(id)
        );
      } else {
        if (viewMode !== 'grid') {
          stagedIds.push(
            ...recentSpeakerIds.filter((id) => !subscribedIds.includes(id))
          );
        }
      }

      // Assemble updates to get to desired cam subscriptions
      const updates = remoteParticipantIds.reduce((u, id) => {
        let desiredSubscription;
        const currentSubscription =
          daily.participants()?.[id]?.tracks?.video?.subscribed;

        // Ignore undefined, local or screenshare participant ids
        if (!id || isLocalId(id) || isScreenId(id)) return u;

        // Decide on desired cam subscription for this participant:
        // subscribed, staged, or unsubscribed
        if (subscribedIds.includes(id)) {
          desiredSubscription = true;
        } else if (stagedIds.includes(id)) {
          desiredSubscription = 'staged';
        } else {
          desiredSubscription = false;
        }

        // Skip if we already have the desired subscription to this
        // participant's cam
        if (desiredSubscription === currentSubscription) return u;

        u[id] = {
          setSubscribedTracks: {
            video: desiredSubscription,
          },
        };
        return u;
      }, {});

      if (Object.keys(updates).length === 0) return;
      daily.updateParticipants(updates);
    },
    [daily, remoteParticipantIds, recentSpeakerIds, viewMode]
  );

  /**
   * Automatically update audio subscriptions.
   */
  useEffect(() => {
    if (!daily) return;
    /**
     * A little throttling as we want daily-js to have some room to breathe ☺️
     */
    const timeout = setTimeout(() => {
      const participants = daily.participants();
      const updates = remoteParticipantIds.reduce((u, id) => {
        // Ignore undefined, local or screenshare participant ids
        if (!id || isLocalId(id) || isScreenId(id)) return u;
        const isSpeaker = recentSpeakerIds.includes(id);
        const hasSubscribed = participants[id]?.tracks?.audio?.subscribed;
        const shouldSubscribe = optimizeLargeCalls ? isSpeaker : true;
        /**
         * In optimized calls:
         * - subscribe to speakers we're not subscribed to, yet
         * - unsubscribe from non-speakers we're subscribed to
         * In non-optimized calls:
         * - subscribe to all who we're not to subscribed to, yet
         */
        if (
          (!hasSubscribed && shouldSubscribe) ||
          (hasSubscribed && !shouldSubscribe)
        ) {
          u[id] = {
            setSubscribedTracks: {
              audio: shouldSubscribe,
            },
          };
        }
        return u;
      }, {});
      if (Object.keys(updates).length === 0) return;
      daily.updateParticipants(updates);
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, [daily, optimizeLargeCalls, recentSpeakerIds, remoteParticipantIds]);

  /**
   * Notify user when pushed out of recent speakers queue.
   */
  const showMutedMessage = useRef(false);
  useEffect(() => {
    if (!daily || !optimizeLargeCalls) return;

    if (recentSpeakerIds.some((id) => isLocalId(id))) {
      showMutedMessage.current = true;
      return;
    }
    if (showMutedMessage.current && daily.participants().local.audio) {
      daily.setLocalAudio(false);
      showMutedMessage.current = false;
    }
  }, [daily, optimizeLargeCalls, recentSpeakerIds]);

  const trackStoppedQueue = useRef([]);
  useEffect(() => {
    const trackStoppedBatchInterval = setInterval(() => {
      if (!trackStoppedQueue.current.length) return;
      dispatch({
        type: 'TRACKS_STOPPED',
        items: trackStoppedQueue.current.splice(
          0,
          trackStoppedQueue.current.length
        ),
      });
    }, 3000);
    return () => {
      clearInterval(trackStoppedBatchInterval);
    };
  }, []);

  const handleTrackStarted = useCallback(({ participant, track }) => {
    /**
     * If track for participant was recently stopped, remove it from queue,
     * so we don't run into a stale state.
     */
    const stoppingIdx = trackStoppedQueue.current.findIndex(
      ([p, t]) =>
        p.session_id === participant.session_id && t.kind === track.kind
    );
    if (stoppingIdx >= 0) {
      trackStoppedQueue.current.splice(stoppingIdx, 1);
    }
    dispatch({
      type: 'TRACK_STARTED',
      participant,
      track,
    });
  }, []);

  const handleTrackStopped = useCallback(({ participant, track }) => {
    if (participant) {
      trackStoppedQueue.current.push([participant, track]);
    }
  }, []);

  const handleParticipantJoined = useCallback(({ participant }) => {
    joinedSubscriptionQueue.current.push(participant.session_id);
  }, []);

  const handleParticipantUpdated = useDeepCompareCallback(
    ({ participant }) => {
      const hasAudioChanged =
        // State changed
        participant.tracks.audio.state !==
        state.audioTracks?.[participant.user_id]?.state ||
        // Screen state changed
        participant.tracks.screenAudio.state !==
        state.audioTracks?.[getScreenId(participant.user_id)]?.state ||
        // Off/blocked reason changed
        !deepEqual(
          {
            ...(participant.tracks.audio?.blocked ?? {}),
            ...(participant.tracks.audio?.off ?? {}),
          },
          {
            ...(state.audioTracks?.[participant.user_id].blocked ?? {}),
            ...(state.audioTracks?.[participant.user_id].off ?? {}),
          }
        );
      const hasVideoChanged =
        // State changed
        participant.tracks.video?.state !==
        state.videoTracks?.[participant.user_id]?.state ||
        // Off/blocked reason changed
        !deepEqual(
          {
            ...(participant.tracks.video?.blocked ?? {}),
            ...(participant.tracks.video?.off ?? {}),
          },
          {
            ...(state.videoTracks?.[participant.user_id]?.blocked ?? {}),
            ...(state.videoTracks?.[participant.user_id]?.off ?? {}),
          }
        );

      if (hasAudioChanged) {
        // Update audio track state
        dispatch({
          type: 'UPDATE_AUDIO_TRACK',
          participant,
        });
      }

      if (hasVideoChanged) {
        // Update video track state
        dispatch({
          type: 'UPDATE_VIDEO_TRACK',
          participant,
        });
      }
    },
    [state.audioTracks, state.videoTracks]
  );

  const handleParticipantLeft = useCallback(({ participant }) => {
    dispatch({
      type: 'REMOVE_TRACKS',
      participant,
    });
  }, []);

  useEffect(() => {
    if (!daily) return;

    daily.on('track-started', handleTrackStarted);
    daily.on('track-stopped', handleTrackStopped);
    daily.on('participant-joined', handleParticipantJoined);
    daily.on('participant-updated', handleParticipantUpdated);
    daily.on('participant-left', handleParticipantLeft);
    return () => {
      daily.off('track-started', handleTrackStarted);
      daily.off('track-stopped', handleTrackStopped);
      daily.off('participant-joined', handleParticipantJoined);
      daily.off('participant-updated', handleParticipantUpdated);
      daily.off('participant-left', handleParticipantLeft);
    };
  }, [
    daily,
    handleParticipantJoined,
    handleParticipantLeft,
    handleParticipantUpdated,
    handleTrackStarted,
    handleTrackStopped
  ]);

  const joinedSubscriptionQueue = useRef([]);
  useEffect(() => {
    if (!daily || subscribeToTracksAutomatically) return;

    const joinBatchInterval = setInterval(async () => {
      if (!joinedSubscriptionQueue.current.length) return;
      const ids = joinedSubscriptionQueue.current.splice(0);
      const participants = daily.participants();
      const topology = (await daily.getNetworkTopology())?.topology;
      const updates = ids.reduce(
        (o, id) => {
          if (!participants?.[id]?.tracks?.audio?.subscribed) {
            o[id] = {
              setSubscribedTracks: {
                screenAudio: true,
                screenVideo: true,
              },
            };
          }
          if (topology === 'peer') {
            o[id] = { setSubscribedTracks: true };
          }
          return o;
        },
        {}
      );
      if (Object.keys(updates).length === 0) return;
      daily.updateParticipants(updates);
    }, 100);
    return () => {
      clearInterval(joinBatchInterval);
    };
  }, [daily, subscribeToTracksAutomatically]);

  useEffect(() => {
    if (optimizeLargeCalls) {
      setMaxCamSubscriptions(30);
    }
  }, [optimizeLargeCalls]);

  return (
    <TracksContext.Provider
      value={{
        audioTracks: state.audioTracks,
        videoTracks: state.videoTracks,
        maxCamSubscriptions,
        subscribeToCam,
        updateCamSubscriptions,
      }}
    >
      {children}
    </TracksContext.Provider>
  );
};

export const useTracks = () => useContext(TracksContext);