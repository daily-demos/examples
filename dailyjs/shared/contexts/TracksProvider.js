/* global rtcpeers */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import PropTypes from 'prop-types';

import { sortByKey } from '../lib/sortByKey';
import { useCallState } from './CallProvider';
import { useParticipants } from './ParticipantsProvider';
import { isLocalId, isScreenId } from './participantsState';
import {
  initialTracksState,
  REMOVE_TRACKS,
  TRACK_STARTED,
  TRACK_STOPPED,
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
const SUBSCRIBE_ALL_VIDEO_THRESHOLD = 9;

const TracksContext = createContext(null);

export const TracksProvider = ({ children }) => {
  const { callObject } = useCallState();
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

  const pauseVideoTrack = useCallback((id) => {
    // Ignore undefined, local or screenshare
    if (
      !id ||
      isLocalId(id) ||
      isScreenId(id) ||
      rtcpeers.getCurrentType() !== 'sfu'
    )
      return;
    if (!rtcpeers.soup.implementationIsAcceptingCalls) {
      return;
    }
    const consumer = rtcpeers.soup?.findConsumerForTrack(id, 'cam-video');
    if (!consumer) {
      rtcpeers.soup.setResumeOnSubscribeForTrack(id, 'cam-video', false);
    } else {
      rtcpeers.soup.pauseConsumer(consumer);
    }
  }, []);

  const resumeVideoTrack = useCallback(
    (id) => {
      // Ignore undefined, local or screenshare
      if (!id || isLocalId(id) || isScreenId(id)) return;

      const videoTrack = callObject.participants()?.[id]?.tracks?.video;
      if (!videoTrack?.subscribed) {
        callObject.updateParticipant(id, {
          setSubscribedTracks: true,
        });
        return;
      }
      if (
        rtcpeers.getCurrentType() !== 'sfu' ||
        !rtcpeers.soup.implementationIsAcceptingCalls
      ) {
        return;
      }
      const consumer = rtcpeers.soup?.findConsumerForTrack(id, 'cam-video');
      if (!consumer) {
        rtcpeers.soup.setResumeOnSubscribeForTrack(id, 'cam-video', true);
      } else {
        rtcpeers.soup.resumeConsumer(consumer);
      }
    },
    [callObject]
  );

  const remoteParticipantIds = useMemo(
    () => participants.filter((p) => !p.isLocal).map((p) => p.id),
    [participants]
  );

  /**
   * Updates cam subscriptions based on passed ids.
   *
   * @param ids Array of ids to subscribe to, all others will be unsubscribed.
   * @param pausedIds Array of ids that should be subscribed, but paused.
   */
  const updateCamSubscriptions = useCallback(
    (ids, pausedIds = []) => {
      if (!callObject) return;
      const subscribedIds =
        remoteParticipantIds.length <= SUBSCRIBE_ALL_VIDEO_THRESHOLD
          ? [...remoteParticipantIds]
          : [...ids, ...recentSpeakerIds];

      const updates = remoteParticipantIds.reduce((u, id) => {
        const shouldSubscribe = subscribedIds.includes(id);
        const shouldPause = pausedIds.includes(id);
        const isSubscribed =
          callObject.participants()?.[id]?.tracks?.video?.subscribed;

        /**
         * Pause already subscribed tracks.
         */
        if (shouldSubscribe && shouldPause) {
          pauseVideoTrack(id);
        }

        if (
          isLocalId(id) ||
          isScreenId(id) ||
          (shouldSubscribe && isSubscribed)
        ) {
          return u;
        }

        const result = {
          setSubscribedTracks: {
            audio: true,
            screenAudio: true,
            screenVideo: true,
            video: shouldSubscribe,
          },
        };
        return { ...u, [id]: result };
      }, {});

      // Fast resume already subscribed videos
      ids
        .filter((id) => !pausedIds.includes(id))
        .forEach((id) => {
          const p = callObject.participants()?.[id];
          if (p?.tracks?.video?.subscribed) {
            resumeVideoTrack(id);
          }
        });

      callObject.updateParticipants(updates);
    },
    [
      callObject,
      remoteParticipantIds,
      recentSpeakerIds,
      pauseVideoTrack,
      resumeVideoTrack,
    ]
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

    const joinBatchInterval = setInterval(() => {
      if (!joinedSubscriptionQueue.length) return;
      const ids = joinedSubscriptionQueue.splice(0);
      const callParticipants = callObject.participants();
      const updates = ids.reduce((o, id) => {
        const { subscribed } = callParticipants?.[id]?.tracks?.audio;
        const result = { ...o[id] };
        if (!subscribed) {
          result.setSubscribedTracks = {
            audio: true,
            screenAudio: true,
            screenVideo: true,
          };
        }

        if (rtcpeers?.getCurrentType?.() === 'peer-to-peer') {
          result.setSubscribedTracks.video = true;
        }
        return { [id]: result };
      }, {});
      callObject.updateParticipants(updates);
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
  }, [callObject, pauseVideoTrack]);

  return (
    <TracksContext.Provider
      value={{
        audioTracks: state.audioTracks,
        videoTracks: state.videoTracks,
        pauseVideoTrack,
        resumeVideoTrack,
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
