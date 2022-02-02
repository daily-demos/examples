import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { sortByKey } from '@custom/shared/lib/sortByKey';
import { useNetworkState } from '../hooks/useNetworkState';
import { useCallState } from './CallProvider';
import { useUIState } from './UIStateProvider';
import {
  initialParticipantsState,
  isLocalId,
  participantsReducer,
} from './participantsState';

export const ParticipantsContext = createContext(null);

export const ParticipantsProvider = ({ children }) => {
  const { isMobile, pinnedId, viewMode } = useUIState();
  const {
    broadcast,
    broadcastRole,
    callObject: daily,
    videoQuality,
  } = useCallState();
  const [state, dispatch] = useReducer(participantsReducer, initialParticipantsState);
  const [participantMarkedForRemoval, setParticipantMarkedForRemoval] = useState(null);

  const { threshold } = useNetworkState();

  /**
   * ALL participants (incl. shared screens) in a convenient array
   */
  const allParticipants = useMemo(
    () => [...state.participants, ...state.screens],
    [state?.participants, state?.screens]
  );

  /**
   * Only return participants that should be visible in the call
   */
  const participants = useMemo(() => {
    if (broadcast) {
      return state.participants.filter((p) => p?.isOwner);
    }
    return state.participants;
  }, [broadcast, state.participants]);

  /**
   * The number of participants, who are not a shared screen
   * (technically a shared screen counts as a participant, but we shouldn't tell humans)
   */
  const participantCount = useMemo(
    () => participants.filter(({ isScreenshare }) => !isScreenshare).length,
    [participants]
  );

  /**
   * The participant who most recently got mentioned via a `active-speaker-change` event
   */
  const activeParticipant = useMemo(
    () => participants.find(({ isActiveSpeaker }) => isActiveSpeaker),
    [participants]
  );

  /**
   * The local participant
   */
  const localParticipant = useMemo(
    () =>
      allParticipants.find(
        ({ isLocal, isScreenshare }) => isLocal && !isScreenshare
      ),
    [allParticipants]
  );

  const isOwner = useMemo(() => !!localParticipant?.isOwner, [
    localParticipant,
  ]);

  /**
   * The participant who should be rendered prominently right now
   */
  const currentSpeaker = useMemo(() => {
    /**
     * Ensure activeParticipant is still present in the call.
     * The activeParticipant only updates to a new active participant so
     * if everyone else is muted when AP leaves, the value will be stale.
     */
    const isPresent = participants.some((p) => p?.id === activeParticipant?.id);
    const pinned = participants.find((p) => p?.id === pinnedId);

    if (pinned) return pinned;

    const displayableParticipants = participants.filter((p) =>
      isMobile ? !p?.isLocal && !p?.isScreenshare : !p?.isLocal
    );

    if (
      !isPresent &&
      displayableParticipants.length > 0 &&
      displayableParticipants.every((p) => p.isMicMuted && !p.lastActiveDate)
    ) {
      // Return first cam on participant in case everybody is muted and nobody ever talked
      // or first remote participant, in case everybody's cam is muted, too.
      return (
        displayableParticipants.find((p) => !p.isCamMuted) ??
        displayableParticipants?.[0]
      );
    }

    const sorted = displayableParticipants
      .sort(sortByKey('lastActiveDate'))
      .reverse();

    const fallback = broadcastRole === 'attendee' ? null : localParticipant;

    return isPresent ? activeParticipant : sorted?.[0] ?? fallback;
  }, [
    activeParticipant,
    broadcastRole,
    isMobile,
    localParticipant,
    participants,
    pinnedId,
  ]);

  /**
   * Screen shares
   */
  const screens = useMemo(() => state?.screens, [state?.screens]);

  /**
   * The local participant's name
   */
  const username = daily?.participants()?.local?.user_name ?? '';

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

  const swapParticipantPosition = useCallback((id1, id2) => {
    /**
     * Ignore in the following cases:
     * - id1 and id2 are equal
     * - one of both ids is not set
     * - one of both ids is 'local'
     */
    if (id1 === id2 || !id1 || !id2 || isLocalId(id1) || isLocalId(id2)) return;
    dispatch({
      type: 'SWAP_POSITION',
      id1,
      id2,
    });
  }, []);

  const [muteNewParticipants, setMuteNewParticipants] = useState(false);

  const muteAll = useCallback(
    (muteFutureParticipants = false) => {
      if (!localParticipant.isOwner) return;
      setMuteNewParticipants(muteFutureParticipants);
      const unmutedParticipants = participants.filter(
        (p) => !p.isLocal && !p.isMicMuted
      );
      if (!unmutedParticipants.length) return;
      daily.updateParticipants(
        unmutedParticipants.reduce((o, p) => {
          o[p.id] = {
            setAudio: false,
          };
          return o;
        }, {})
      );
    },
    [daily, localParticipant, participants]
  );

  const handleParticipantJoined = useCallback(() => {
    dispatch({
      type: 'JOINED_MEETING',
      participant: daily.participants().local,
    });
  }, [daily]);

  const handleNewParticipantsState = useCallback(
    (event = null) => {
      switch (event?.action) {
        case 'participant-joined':
          dispatch({
            type: 'PARTICIPANT_JOINED',
            participant: event.participant,
          });
          if (muteNewParticipants && daily) {
            daily.updateParticipant(event.participant.session_id, {
              setAudio: false,
            });
          }
          break;
        case 'participant-updated':
          dispatch({
            type: 'PARTICIPANT_UPDATED',
            participant: event.participant,
          });
          break;
        case 'participant-left':
          dispatch({
            type: 'PARTICIPANT_LEFT',
            participant: event.participant,
          });
          break;
      }
    },
    [daily, dispatch, muteNewParticipants]
  );

  useEffect(() => {
    if (!daily) return;

    daily.on('participant-joined', handleParticipantJoined);
    daily.on('participant-joined', handleNewParticipantsState);
    daily.on('participant-updated', handleNewParticipantsState);
    daily.on('participant-left', handleNewParticipantsState);

    return () => {
      daily.off('participant-joined', handleParticipantJoined);
      daily.off('participant-joined', handleNewParticipantsState);
      daily.off('participant-updated', handleNewParticipantsState);
      daily.off('participant-left', handleNewParticipantsState);
    };
  }, [daily, handleNewParticipantsState, handleParticipantJoined]);

  const participantIds = useMemo(
    () => participants.map((p) => p.id).join(','),
    [participants]
  );

  const setBandWidthControls = useCallback(() => {
    if (!(daily && daily.meetingState() === 'joined-meeting')) return;

    const ids = participantIds.split(',').filter(Boolean);
    const receiveSettings = {};

    ids.forEach((id) => {
      if (isLocalId(id)) return;

      if (
        // weak or bad network
        (['low', 'very-low'].includes(threshold) && videoQuality === 'auto') ||
        // Low quality or Bandwidth saver mode enabled
        ['bandwidth-saver', 'low'].includes(videoQuality)
      ) {
        receiveSettings[id] = { video: { layer: 0 } };
        return;
      }

      // Speaker view settings based on speaker status or pinned user
      if (viewMode === 'speaker') {
        if (currentSpeaker?.id === id) {
          receiveSettings[id] = { video: { layer: 2 } };
        } else {
          receiveSettings[id] = { video: { layer: 0 } };
        }
      }

      // Grid view settings are handled separately in GridView
      // Mobile view settings are handled separately in MobileCall
    });

    daily.updateReceiveSettings(receiveSettings);
  }, [
    currentSpeaker?.id,
    daily,
    participantIds,
    threshold,
    videoQuality,
    viewMode,
  ]);

  useEffect(() => {
    setBandWidthControls();
  }, [setBandWidthControls]);

  useEffect(() => {
    if (!daily) return;
    const handleActiveSpeakerChange = ({ activeSpeaker }) => {
      /**
       * Ignore active-speaker-change events for the local user.
       * Our UX doesn't ever highlight the local user as the active speaker.
       */
      const localId = daily.participants().local.session_id;
      const activeSpeakerId = activeSpeaker?.peerId;
      if (localId === activeSpeakerId) return;

      dispatch({
        type: 'ACTIVE_SPEAKER',
        id: activeSpeakerId,
      });
    };
    daily.on('active-speaker-change', handleActiveSpeakerChange);
    return () =>
      daily.off('active-speaker-change', handleActiveSpeakerChange);
  }, [daily]);

  return (
    <ParticipantsContext.Provider
      value={{
        allParticipants,
        currentSpeaker,
        localParticipant,
        muteAll,
        muteNewParticipants,
        participantCount,
        participantMarkedForRemoval,
        participants,
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