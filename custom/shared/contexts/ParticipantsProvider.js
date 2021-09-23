import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
  useMemo,
} from 'react';
import {
  useUIState,
  VIEW_MODE_SPEAKER,
} from '@custom/shared/contexts/UIStateProvider';
import PropTypes from 'prop-types';

import {
  VIDEO_QUALITY_AUTO,
  VIDEO_QUALITY_BANDWIDTH_SAVER,
  VIDEO_QUALITY_LOW,
  VIDEO_QUALITY_VERY_LOW,
} from '../constants';
import { sortByKey } from '../lib/sortByKey';

import { useCallState } from './CallProvider';

import {
  initialParticipantsState,
  isLocalId,
  ACTIVE_SPEAKER,
  PARTICIPANT_JOINED,
  PARTICIPANT_LEFT,
  PARTICIPANT_UPDATED,
  participantsReducer,
  SWAP_POSITION,
} from './participantsState';

export const ParticipantsContext = createContext();

export const ParticipantsProvider = ({ children }) => {
  const { callObject, videoQuality, networkState } = useCallState();
  const [state, dispatch] = useReducer(
    participantsReducer,
    initialParticipantsState
  );
  const { viewMode } = useUIState();
  const [participantMarkedForRemoval, setParticipantMarkedForRemoval] =
    useState(null);

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
  const participants = useMemo(() => state.participants, [state.participants]);

  /**
   * Array of participant IDs
   */
  const participantIds = useMemo(
    () => participants.map((p) => p.id).join(','),
    [participants]
  );

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

  const isOwner = useMemo(
    () => !!localParticipant?.isOwner,
    [localParticipant]
  );

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

    const displayableParticipants = participants.filter((p) => !p?.isLocal);

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
      .sort((a, b) => sortByKey(a, b, 'lastActiveDate'))
      .reverse();

    return isPresent ? activeParticipant : sorted?.[0] ?? localParticipant;
  }, [activeParticipant, localParticipant, participants]);

  /**
   * Screen shares
   */
  const screens = useMemo(
    () => allParticipants.filter(({ isScreenshare }) => isScreenshare),
    [allParticipants]
  );

  /**
   * The local participant's name
   */
  const username = callObject?.participants()?.local?.user_name ?? '';

  const [muteNewParticipants, setMuteNewParticipants] = useState(false);

  const muteAll = useCallback(
    (muteFutureParticipants = false) => {
      if (!localParticipant.isOwner) return;
      setMuteNewParticipants(muteFutureParticipants);
      const unmutedParticipants = participants.filter(
        (p) => !p.isLocal && !p.isMicMuted
      );
      if (!unmutedParticipants.length) return;
      const result = unmutedParticipants.reduce(
        (o, p) => ({ ...o[p.id], setAudio: false }),
        {}
      );
      callObject.updateParticipants(result);
    },
    [callObject, localParticipant, participants]
  );

  /**
   * Sets the local participant's name in daily-js
   * @param name The new username
   */
  const setUsername = (name) => {
    callObject.setUserName(name);
  };

  const swapParticipantPosition = (id1, id2) => {
    if (id1 === id2 || !id1 || !id2 || isLocalId(id1) || isLocalId(id2)) return;
    dispatch({
      type: SWAP_POSITION,
      id1,
      id2,
    });
  };

  const handleNewParticipantsState = useCallback(
    (event = null) => {
      switch (event?.action) {
        case 'participant-joined':
          dispatch({
            type: PARTICIPANT_JOINED,
            participant: event.participant,
          });
          break;
        case 'participant-updated':
          dispatch({
            type: PARTICIPANT_UPDATED,
            participant: event.participant,
          });
          break;
        case 'participant-left':
          dispatch({
            type: PARTICIPANT_LEFT,
            participant: event.participant,
          });
          break;
        default:
          break;
      }
    },
    [dispatch]
  );

  /**
   * Start listening for participant changes, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) return false;

    console.log('👥 Participant provider events bound');

    const events = [
      'joined-meeting',
      'participant-joined',
      'participant-updated',
      'participant-left',
    ];

    // Use initial state
    handleNewParticipantsState();

    // Listen for changes in state
    events.forEach((event) => callObject.on(event, handleNewParticipantsState));

    // Stop listening for changes in state
    return () =>
      events.forEach((event) =>
        callObject.off(event, handleNewParticipantsState)
      );
  }, [callObject, handleNewParticipantsState]);

  /**
   * Change between the simulcast layers based on view / available bandwidth
   */
  const setBandWidthControls = useCallback(() => {
    if (!(callObject && callObject.meetingState() === 'joined-meeting')) return;

    const ids = participantIds.split(',');
    const receiveSettings = {};

    ids.forEach((id) => {
      if (isLocalId(id)) return;

      if (
        // weak or bad network
        ([VIDEO_QUALITY_LOW, VIDEO_QUALITY_VERY_LOW].includes(networkState) &&
          videoQuality === VIDEO_QUALITY_AUTO) ||
        // Low quality or Bandwidth saver mode enabled
        [VIDEO_QUALITY_BANDWIDTH_SAVER, VIDEO_QUALITY_LOW].includes(
          videoQuality
        )
      ) {
        receiveSettings[id] = { video: { layer: 0 } };
        return;
      }

      // Speaker view settings based on speaker status or pinned user
      if (viewMode === VIEW_MODE_SPEAKER) {
        if (currentSpeaker?.id === id) {
          receiveSettings[id] = { video: { layer: 2 } };
        } else {
          receiveSettings[id] = { video: { layer: 0 } };
        }
      }

      // Grid view settings are handled separately in GridView
    });
    callObject.updateReceiveSettings(receiveSettings);
  }, [
    currentSpeaker?.id,
    callObject,
    networkState,
    participantIds,
    videoQuality,
    viewMode,
  ]);

  useEffect(() => {
    setBandWidthControls();
  }, [setBandWidthControls]);

  useEffect(() => {
    if (!callObject) return false;
    const handleActiveSpeakerChange = ({ activeSpeaker }) => {
      /**
       * Ignore active-speaker-change events for the local user.
       * Our UX doesn't ever highlight the local user as the active speaker.
       */
      const localId = callObject.participants().local.session_id;
      if (localId === activeSpeaker?.peerId) return;

      dispatch({
        type: ACTIVE_SPEAKER,
        id: activeSpeaker?.peerId,
      });
    };
    callObject.on('active-speaker-change', handleActiveSpeakerChange);
    return () =>
      callObject.off('active-speaker-change', handleActiveSpeakerChange);
  }, [callObject]);

  return (
    <ParticipantsContext.Provider
      value={{
        activeParticipant,
        allParticipants,
        currentSpeaker,
        localParticipant,
        participantCount,
        participantMarkedForRemoval,
        participants,
        screens,
        muteNewParticipants,
        muteAll,
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

ParticipantsProvider.propTypes = {
  children: PropTypes.node,
};

export const useParticipants = () => useContext(ParticipantsContext);
