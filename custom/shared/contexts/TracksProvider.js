import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useDaily,
  useLocalParticipant,
  useNetwork,
  useParticipantIds,
  useThrottledDailyEvent
} from '@daily-co/daily-react-hooks';

import { useCallState } from './CallProvider';
import { useParticipantMetaData } from './ParticipantsProvider';
import { useUIState } from './UIStateProvider';

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
  const daily = useDaily();
  const { optimizeLargeCalls, subscribeToTracksAutomatically } = useCallState();
  const participantMetaData = useParticipantMetaData();
  const { viewMode } = useUIState();
  const [maxCamSubscriptions, setMaxCamSubscriptions] = useState(null);

  const { topology } = useNetwork();

  const sortedSpeakerIds = useParticipantIds({
    // Filter for participants that have spoken at least once.
    filter: useCallback(
      (p) => Boolean(participantMetaData[p.session_id]?.last_active_date),
      [participantMetaData]
    ),
    // Sort speakers by most recent active date, so we can grab the
    // most recent ${MAX_RECENT_SPEAKER_COUNT} speakers afterwards.
    sort: useCallback(
      (a, b) => {
        const lastActiveA = participantMetaData[a.session_id]?.last_active_date;
        const lastActiveB = participantMetaData[b.session_id]?.last_active_date;
        // A has spoken more recently than B, sort A before B
        if (lastActiveA > lastActiveB) return -1;
        // B has spoken more recently than A, sort B before A
        if (lastActiveA < lastActiveB) return 1;
        return 0;
      },
      [participantMetaData]
    ),
  });

  /**
   * Contains the ${MAX_RECENT_SPEAKER_COUNT} most recent speakers,
   * ordered by their most recent audio activity.
   */
  const recentSpeakerIds = useMemo(
    () => sortedSpeakerIds.slice(0, MAX_RECENT_SPEAKER_COUNT),
    [sortedSpeakerIds]
  );

  const localParticipant = useLocalParticipant();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });

  const subscribeToCam = useCallback(
    (id) => {
      /**
       * Ignore undefined, local or screenshare.
       */
      if (!id || id === localParticipant?.session_id) return;
      daily.updateParticipant(id, {
        setSubscribedTracks: { video: true },
      });
    },
    [daily, localParticipant?.session_id]
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
        if (!id || id === localParticipant?.session_id) return u;

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

      if (!subscribeToTracksAutomatically && Object.keys(updates).length > 0) {
        daily.updateParticipants(updates);
      }
    },
    [
      daily,
      remoteParticipantIds,
      subscribeToTracksAutomatically,
      viewMode,
      recentSpeakerIds,
      localParticipant?.session_id,
    ]
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
        if (!id || id === localParticipant?.session_id) return u;
        const isSpeaker = recentSpeakerIds.includes(id);
        const hasSubscribed = participants[id]?.tracks?.audio?.subscribed;
        const shouldSubscribe =
          topology === 'sfu' && optimizeLargeCalls ? isSpeaker : true;
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
      if (!subscribeToTracksAutomatically && Object.keys(updates).length > 0) {
        daily.updateParticipants(updates);
      }
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, [
    daily,
    localParticipant?.session_id,
    optimizeLargeCalls,
    recentSpeakerIds,
    remoteParticipantIds,
    subscribeToTracksAutomatically,
    topology,
  ]);

  /**
   * Notify user when pushed out of recent speakers queue.
   */
  const showMutedMessage = useRef(false);
  useEffect(() => {
    if (!daily || !optimizeLargeCalls) return;

    if (recentSpeakerIds.some((id) => id === localParticipant?.session_id)) {
      showMutedMessage.current = true;
      return;
    }
    if (showMutedMessage.current && daily.participants().local.audio) {
      daily.setLocalAudio(false);
      showMutedMessage.current = false;
    }
  }, [
    daily,
    localParticipant?.session_id,
    optimizeLargeCalls,
    recentSpeakerIds,
  ]);

  useThrottledDailyEvent(
    'participant-joined',
    useCallback(
      async (events) => {
        const ids = events.map((ev) => ev.participant.session_id);
        const participants = daily.participants();
        const topology = (await daily.getNetworkTopology())?.topology;
        const updates = ids.reduce((o, id) => {
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
        }, {});
        if (
          !subscribeToTracksAutomatically &&
          Object.keys(updates).length > 0
        ) {
          daily.updateParticipants(updates);
        }
      },
      [daily, subscribeToTracksAutomatically]
    )
  );

  useEffect(() => {
    if (optimizeLargeCalls) {
      setMaxCamSubscriptions(30);
    }
  }, [optimizeLargeCalls]);

  return (
    <TracksContext.Provider
      value={{
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