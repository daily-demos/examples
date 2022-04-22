import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  useParticipantIds,
  useLocalParticipant,
  useActiveParticipant,
  useScreenShare,
  useDaily,
  useThrottledDailyEvent
} from '@daily-co/daily-react-hooks';
import { atom, useRecoilCallback, useRecoilValue } from 'recoil';
import { useCallState } from './CallProvider';
import { useUIState } from './UIStateProvider';

export const ParticipantsContext = createContext(null);

const participantMetaDataState = atom({
  key: 'participant-meta-data',
  default: {},
});

export const useParticipantMetaData = () =>
  useRecoilValue(participantMetaDataState);

export const ParticipantsProvider = ({ children }) => {
  const { pinnedId } = useUIState();
  const {
    broadcast,
    broadcastRole,
  } = useCallState();
  const daily = useDaily();

  const [participantMarkedForRemoval, setParticipantMarkedForRemoval] = useState(null);

  useThrottledDailyEvent(
    'active-speaker-change',
    useRecoilCallback(
      ({ set }) =>
        (events) => {
          set(participantMetaDataState, (m) => {
            const newMetaData = { ...m };
            events.forEach((ev) => {
              if (!ev.activeSpeaker?.peerId) return;
              newMetaData[ev.activeSpeaker.peerId] = {
                ...newMetaData[ev.activeSpeaker.peerId],
                last_active_date: new Date(),
              };
            });
            return newMetaData;
          });
        },
      []
    )
  );

  /**
   * Only return participant ids that should be visible in the call
   */
  const participantIds = useParticipantIds({
    filter: useCallback(
      (p) => {
        if (broadcast) return p.owner;
        return true;
      },
      [broadcast]
    ),
  });

  /**
   * The number of participants, who are not a shared screen
   * (technically a shared screen counts as a participant, but we shouldn't tell humans)
   */
  const participantCount = useMemo(
    () => participantIds.length,
    [participantIds]
  );

  /**
   * The participant who most recently got mentioned via a `active-speaker-change` event
   */
  const activeParticipant = useActiveParticipant({ ignoreLocal: true });

  /**
   * The local participant
   */
  const localParticipant = useLocalParticipant();

  const isOwner = useMemo(() => !!localParticipant?.owner, [
    localParticipant,
  ]);

  const participantMetaData = useParticipantMetaData();

  /**
   * The participant who should be rendered prominently right now
   */
  const currentSpeakerId = useMemo(() => {
    if (!daily) return null;
    /**
     * Ensure activeParticipant is still present in the call.
     * The activeParticipant only updates to a new active participant so
     * if everyone else is muted when AP leaves, the value will be stale.
     */
    const isPresent = participantIds.includes(activeParticipant?.session_id);
    const isPinnedPresent = participantIds.includes(pinnedId);

    if (isPinnedPresent) return pinnedId;

    const displayableIds = participantIds.filter(
      (id) => id !== localParticipant?.session_id
    );
    const participants = Object.values(daily.participants());

    if (
      !isPresent &&
      displayableIds.length > 0 &&
      displayableIds.every((id) => {
        const p = participants.find((p) => p.session_id === id);
        return !p?.audio && !participantMetaData[id]?.last_active_date;
      })
    ) {
      // Return first cam on participant in case everybody is muted and nobody ever talked
      // or first remote participant, in case everybody's cam is muted, too.
      return (
        displayableIds.find((id) => {
          const p = participants.find((p) => p.session_id === id);
          return p?.video;
        }) ?? displayableIds?.[0]
      );
    }

    const sorted = displayableIds
      .sort((a, b) => {
        const lastActiveA = participantMetaData[a]?.last_active_date;
        const lastActiveB = participantMetaData[b]?.last_active_date;
        if (lastActiveA > lastActiveB) return 1;
        if (lastActiveA < lastActiveB) return -1;
        return 0;
      })
      .reverse();

    const fallback =
      broadcastRole === 'attendee' ? null : localParticipant?.session_id;

    return isPresent ? activeParticipant?.session_id : sorted?.[0] ?? fallback;
  }, [
    activeParticipant,
    broadcastRole,
    daily,
    localParticipant,
    participantIds,
    participantMetaData,
    pinnedId,
  ]);

  /**
   * Screen shares
   */
  const { screens } = useScreenShare();

  /**
   * The local participant's name
   */
  const username = useMemo(() => localParticipant?.user_name ?? '', [
    localParticipant
  ]);

  /**
   * Sets the local participant's name in daily-js
   * @param name The new username
   */
  const setUsername = useCallback(
    (name) => {
      daily.setUserName(name);
    },
    [daily]
  );

  /**
   * Maintain positions for each participant in Speaker & Grid view.
   */
  const [orderedParticipantIds, setOrderedParticipantIds] = useState([]);
  useThrottledDailyEvent(
    'participant-joined',
    useCallback(
      (events) => {
        setOrderedParticipantIds((prevIds) => {
          let newIds = prevIds;
          events.forEach((ev) => {
            // Append video-off-participant to end of list
            if (!ev.participant.video) {
              newIds = [...newIds, ev.participant.session_id];
              return;
            }
            const participants = Object.values(daily.participants());
            const idObjects = newIds
              .map((id) => participants.find((p) => p.session_id === id))
              .filter(Boolean);
            const firstInactiveCamOffIndex = idObjects.findIndex(
              (p) =>
                ['off', 'blocked'].includes(p?.tracks?.video?.state) &&
                !p?.local &&
                p?.session_id !== activeParticipant?.session_id
            );
            if (firstInactiveCamOffIndex >= 0) {
              // Add video-on-participant before first remote inactive video-off-participant
              idObjects.splice(firstInactiveCamOffIndex, 0, ev.participant);
              newIds = idObjects.map((p) => p?.session_id).filter(Boolean);
              return;
            }
            newIds = [...newIds, ev.participant.session_id];
          });
          return newIds;
        });
      },
      [activeParticipant?.session_id, daily]
    ),
    250
  );
  useThrottledDailyEvent(
    'participant-left',
    useRecoilCallback(
      ({ set }) =>
        (events) => {
          setOrderedParticipantIds((prevIds) =>
            prevIds.filter(
              (id) => !events.some((ev) => ev.participant.session_id === id)
            )
          );
          set(participantMetaDataState, (md) => {
            const newMetaData = { ...md };
            events.forEach((ev) => {
              delete newMetaData[ev.participant.session_id];
            });
            return newMetaData;
          });
        },
      []
    ),
    250
  );

  /**
   * Swaps the position of 2 participants identified by their session_id.
   */
  const swapParticipantPosition = useCallback((id1, id2) => {
    /**
     * Ignore in the following cases:
     * - id1 and id2 are equal
     * - one of both ids is not set
     */
    if (id1 === id2 || !id1 || !id2) return;
    setOrderedParticipantIds((prevIds) => {
      const newIds = prevIds.slice();
      const idx1 = prevIds.indexOf(id1);
      const idx2 = prevIds.indexOf(id2);
      /**
       * Could not find one of both ids in array.
       * This can be due to a race condition when a participant leaves,
       * while a swap of positions is triggered.
       */
      if (idx1 === -1 || idx2 === -1) return prevIds;
      newIds[idx1] = id2;
      newIds[idx2] = id1;
      return newIds;
    });
  }, []);

  const [muteNewParticipants, setMuteNewParticipants] = useState(false);

  const unmutedIds = useParticipantIds({
    filter: useCallback((p) => !p.local && p.audio, []),
  });

  const muteAll = useCallback(
    (muteFutureParticipants = false) => {
      if (!localParticipant?.owner) return;
      setMuteNewParticipants(muteFutureParticipants);
      if (!unmutedIds.length) return;
      daily.updateParticipants(
        unmutedIds.reduce((o, id) => {
          o[id] = {
            setAudio: false,
          };
          return o;
        }, {})
      );
    },
    [daily, localParticipant, unmutedIds]
  );

  return (
    <ParticipantsContext.Provider
      value={{
        currentSpeakerId,
        localParticipant,
        orderedParticipantIds,
        muteAll,
        muteNewParticipants,
        participantCount,
        participantMarkedForRemoval,
        participantIds,
        screens,
        setParticipantMarkedForRemoval,
        setUsername,
        swapParticipantPosition,
        username,
        isOwner,
      }}
    >
      {children}
    </ParticipantsContext.Provider>
  );
};

export const useParticipants = () => useContext(ParticipantsContext);