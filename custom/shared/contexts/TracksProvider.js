/* global rtcpeers */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import deepEqual from 'fast-deep-equal';
import PropTypes from 'prop-types';
import { useDeepCompareEffect } from 'use-deep-compare';
import { sortByKey } from '../lib/sortByKey';
import { useCallState } from './CallProvider';
import { useParticipants } from './ParticipantsProvider';
import { isLocalId, isScreenId } from './participantsState';
import {
  initialTracksState,
  REMOVE_TRACKS,
  TRACK_STARTED,
  TRACK_STOPPED,
  TRACK_VIDEO_UPDATED,
  TRACK_AUDIO_UPDATED,
  tracksReducer,
} from './tracksState';

/**
 * Maximum amount of concurrently subscribed most recent speakers.
 */
const MAX_RECENT_SPEAKER_COUNT = 6;
/**
 * Threshold up to which all videos will be subscribed.
 * If the remote participant count passes this threshold,
 * cam subscriptions are defined by UI view modes.
 */
const SUBSCRIBE_OR_STAGE_ALL_VIDEO_THRESHOLD = 9;

const TracksContext = createContext(null);

export const TracksProvider = ({ children }) => {
  const { callObject, subscribeToTracksAutomatically } = useCallState();
  const { participants } = useParticipants();
  const [state, dispatch] = useReducer(tracksReducer, initialTracksState);

  const recentSpeakerIds = useMemo(
    () =>
      participants
        .filter((p) => Boolean(p.lastActiveDate) && !p.isLocal)
        .sort((a, b) => sortByKey(a, b, 'lastActiveDate'))
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
      // Ignore undefined, local or screenshare.
      if (!id || isLocalId(id) || isScreenId(id)) return;
      callObject.updateParticipant(id, {
        setSubscribedTracks: { video: true },
      });
    },
    [callObject]
  );

  /**
   * Updates cam subscriptions based on passed subscribedIds and stagedIds.
   * For ids not provided, cam tracks will be unsubscribed from
   */
  const updateCamSubscriptions = useCallback(
    (subscribedIds, stagedIds = []) => {
      if (!callObject) return;

      // If total number of remote participants is less than a threshold, simply
      // stage all remote cams that aren't already marked for subscription.
      // Otherwise, honor the provided stagedIds, with recent speakers appended
      // who aren't already marked for subscription.
      const stagedIdsFiltered =
        remoteParticipantIds.length <= SUBSCRIBE_OR_STAGE_ALL_VIDEO_THRESHOLD
          ? remoteParticipantIds.filter((id) => !subscribedIds.includes(id))
          : [
              ...stagedIds,
              ...recentSpeakerIds.filter((id) => !subscribedIds.includes(id)),
            ];

      // Assemble updates to get to desired cam subscriptions
      const updates = remoteParticipantIds.reduce((u, id) => {
        let desiredSubscription;
        const currentSubscription =
          callObject.participants()?.[id]?.tracks?.video?.subscribed;

        // Ignore undefined, local or screenshare participant ids
        if (!id || isLocalId(id) || isScreenId(id)) return u;

        // Decide on desired cam subscription for this participant:
        // subscribed, staged, or unsubscribed
        if (subscribedIds.includes(id)) {
          desiredSubscription = true;
        } else if (stagedIdsFiltered.includes(id)) {
          desiredSubscription = 'staged';
        } else {
          desiredSubscription = false;
        }

        // Skip if we already have the desired subscription to this
        // participant's cam
        if (desiredSubscription === currentSubscription) return u;

        u[id] = {
          setSubscribedTracks: {
            audio: true,
            screenAudio: true,
            screenVideo: true,
            video: desiredSubscription,
          },
        };
        return u;
      }, {});

      if (Object.keys(updates).length === 0) return;
      callObject.updateParticipants(updates);
    },
    [callObject, remoteParticipantIds, recentSpeakerIds]
  );

  useEffect(() => {
    if (!callObject) return false;

    const trackStoppedQueue = [];

    const handleTrackStarted = ({ participant, track }) => {
      /**
       * If track for participant was recently stopped, remove it from queue,
       * so we don't run into a stale state
       */
      const stoppingIdx = trackStoppedQueue.findIndex(
        ([p, t]) =>
          p.session_id === participant.session_id && t.kind === track.kind
      );
      if (stoppingIdx >= 0) {
        trackStoppedQueue.splice(stoppingIdx, 1);
      }
      dispatch({
        type: TRACK_STARTED,
        participant,
        track,
      });
    };

    const trackStoppedBatchInterval = setInterval(() => {
      if (!trackStoppedQueue.length) return;
      dispatch({
        type: TRACK_STOPPED,
        items: trackStoppedQueue.splice(0, trackStoppedQueue.length),
      });
    }, 3000);

    const handleTrackStopped = ({ participant, track }) => {
      if (participant) {
        trackStoppedQueue.push([participant, track]);
      }
    };

    const handleParticipantLeft = ({ participant }) => {
      dispatch({
        type: REMOVE_TRACKS,
        participant,
      });
    };

    const joinedSubscriptionQueue = [];

    const handleParticipantJoined = ({ participant }) => {
      joinedSubscriptionQueue.push(participant.session_id);
    };

    const joinBatchInterval = setInterval(async () => {
      if (!joinedSubscriptionQueue.length) return;
      const ids = joinedSubscriptionQueue.splice(0);
      const participants = callObject.participants();
      const topology = (await callObject.getNetworkTopology())?.topology;
      const updates = ids.reduce((o, id) => {
        if (!participants?.[id]?.tracks?.audio?.subscribed) {
          o[id] = {
            setSubscribedTracks: {
              audio: true,
              screenAudio: true,
              screenVideo: true,
            },
          };
        }
        if (topology === 'peer') {
          o[id] = { setSubscribedTracks: true };
        }
        return o;
      }, {});

      if (!subscribeToTracksAutomatically && Object.keys(updates).length0) {
        callObject.updateParticipants(updates);
      }
    }, 100);

    callObject.on('track-started', handleTrackStarted);
    callObject.on('track-stopped', handleTrackStopped);
    callObject.on('participant-joined', handleParticipantJoined);
    callObject.on('participant-left', handleParticipantLeft);
    return () => {
      clearInterval(joinBatchInterval);
      clearInterval(trackStoppedBatchInterval);
      callObject.off('track-started', handleTrackStarted);
      callObject.off('track-stopped', handleTrackStopped);
      callObject.off('participant-joined', handleParticipantJoined);
      callObject.off('participant-left', handleParticipantLeft);
    };
  }, [callObject, subscribeToTracksAutomatically]);

  useDeepCompareEffect(() => {
    if (!callObject) return;

    const handleParticipantUpdated = ({ participant }) => {
      const hasAudioChanged =
        // State changed
        participant.tracks.audio?.state !==
          state.audioTracks?.[participant.user_id]?.state ||
        // Off/blocked reason changed
        !deepEqual(
          {
            ...(participant.tracks.audio?.blocked ?? {}),
            ...(participant.tracks.audio?.off ?? {}),
          },
          {
            ...(state.audioTracks?.[participant.user_id]?.blocked ?? {}),
            ...(state.audioTracks?.[participant.user_id]?.off ?? {}),
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
          type: TRACK_AUDIO_UPDATED,
          participant,
        });
      }

      if (hasVideoChanged) {
        // Update video track state
        dispatch({
          type: TRACK_VIDEO_UPDATED,
          participant,
        });
      }
    };

    callObject.on('participant-updated', handleParticipantUpdated);
    return () => {
      callObject.off('participant-updated', handleParticipantUpdated);
    };
  }, [callObject, state.audioTracks, state.videoTracks]);

  return (
    <TracksContext.Provider
      value={{
        audioTracks: state.audioTracks,
        videoTracks: state.videoTracks,
        subscribeToCam,
        updateCamSubscriptions,
        remoteParticipantIds,
        recentSpeakerIds,
      }}
    >
      {children}
    </TracksContext.Provider>
  );
};

TracksProvider.propTypes = {
  children: PropTypes.node,
};

export const useTracks = () => useContext(TracksContext);
