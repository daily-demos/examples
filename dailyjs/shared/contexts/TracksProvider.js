import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import PropTypes from 'prop-types';

import { useCallState } from './CallProvider';
import {
  initialTracksState,
  REMOVE_TRACKS,
  TRACK_STARTED,
  TRACK_STOPPED,
  UPDATE_TRACKS,
  tracksReducer,
} from './tracksState';

const TracksContext = createContext(null);

export const TracksProvider = ({ children }) => {
  const { callObject } = useCallState();
  const [state, dispatch] = useReducer(tracksReducer, initialTracksState);

  useEffect(() => {
    if (!callObject) return false;

    const handleTrackStarted = ({ participant, track }) => {
      dispatch({
        type: TRACK_STARTED,
        participant,
        track,
      });
    };
    const handleTrackStopped = ({ participant, track }) => {
      if (participant) {
        dispatch({
          type: TRACK_STOPPED,
          participant,
          track,
        });
      }
    };
    const handleParticipantLeft = ({ participant }) => {
      dispatch({
        type: REMOVE_TRACKS,
        participant,
      });
    };
    const handleParticipantUpdated = ({ participant }) => {
      dispatch({
        type: UPDATE_TRACKS,
        participant,
      });
    };

    const joinedSubscriptionQueue = [];

    const handleParticipantJoined = ({ participant }) => {
      joinedSubscriptionQueue.push(participant.session_id);
    };

    const batchInterval = setInterval(() => {
      if (!joinedSubscriptionQueue.length) return;
      const ids = joinedSubscriptionQueue.splice(0);
      const participants = callObject.participants();
      const updates = ids.reduce((o, id) => {
        const { subscribed } = participants?.[id]?.tracks?.audio;
        if (!subscribed) {
          o[id] = {
            setSubscribedTracks: {
              audio: true,
              screenAudio: true,
              screenVideo: true,
            },
          };
        }
        return o;
      }, {});
      callObject.updateParticipants(updates);
    }, 100);

    callObject.on('track-started', handleTrackStarted);
    callObject.on('track-stopped', handleTrackStopped);
    callObject.on('participant-joined', handleParticipantJoined);
    callObject.on('participant-left', handleParticipantLeft);
    callObject.on('participant-updated', handleParticipantUpdated);
    return () => {
      clearInterval(batchInterval);
      callObject.off('track-started', handleTrackStarted);
      callObject.off('track-stopped', handleTrackStopped);
      callObject.off('participant-joined', handleParticipantJoined);
      callObject.off('participant-left', handleParticipantLeft);
      callObject.off('participant-updated', handleParticipantUpdated);
    };
  }, [callObject]);

  const pauseVideoTrack = useCallback(
    (id) => {
      if (!callObject) return;
      /**
       * Ignore undefined, local or screenshare.
       */
      if (!id || id.includes('local') || id.includes('screen')) return;
      // eslint-disable-next-line
      if (!rtcpeers.soup.implementationIsAcceptingCalls) {
        return;
      }
      // eslint-disable-next-line
      const consumer = rtcpeers.soup?.findConsumerForTrack(id, 'cam-video');
      if (!consumer) return;
      // eslint-disable-next-line
      rtcpeers.soup?.pauseConsumer(consumer);
    },
    [callObject]
  );

  const resumeVideoTrack = useCallback(
    (id) => {
      /**
       * Ignore undefined, local or screenshare.
       */
      if (!id || id.includes('local') || id.includes('screen')) return;

      const videoTrack = callObject.participants()?.[id]?.tracks?.video;
      if (!videoTrack?.subscribed) {
        callObject.updateParticipant(id, {
          setSubscribedTracks: true,
        });
        return;
      }
      // eslint-disable-next-line
      if (!rtcpeers.soup.implementationIsAcceptingCalls) {
        return;
      }
      // eslint-disable-next-line
      const consumer = rtcpeers.soup?.findConsumerForTrack(id, 'cam-video');
      if (!consumer) return;
      // eslint-disable-next-line
      rtcpeers.soup?.resumeConsumer(consumer);
    },
    [callObject]
  );

  return (
    <TracksContext.Provider
      value={{
        audioTracks: state.audioTracks,
        pauseVideoTrack,
        resumeVideoTrack,
        videoTracks: state.videoTracks,
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
