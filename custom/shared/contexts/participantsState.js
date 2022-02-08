/**
 * Call state is comprised of:
 * - "Call items" (inputs to the call, i.e. participants or shared screens)
 * - UI state that depends on call items (for now, just whether to show "click allow" message)
 *
 * Call items are keyed by id:
 * - "local" for the current participant
 * - A session id for each remote participant
 * - "<id>-screen" for each shared screen
 */
import fasteq from 'fast-deep-equal';
import {
  DEVICE_STATE_OFF,
  DEVICE_STATE_BLOCKED,
  DEVICE_STATE_LOADING,
} from './useDevices';

const initialParticipantsState = {
  lastPendingUnknownActiveSpeaker: null,
  participants: [
    {
      camMutedByHost: false,
      hasNameSet: false,
      id: 'local',
      user_id: '',
      isActiveSpeaker: false,
      isCamMuted: false,
      isLoading: true,
      isLocal: true,
      isMicMuted: false,
      isOwner: false,
      isRecording: false,
      isScreenshare: false,
      lastActiveDate: null,
      micMutedByHost: false,
      name: '',
    },
  ],
  screens: [],
};

// --- Derived data ---

function getId(participant) {
  return participant.local ? 'local' : participant.user_id;
}

function getScreenId(id) {
  return `${id}-screen`;
}

function isLocalId(id) {
  return typeof id === 'string' && id === 'local';
}

function isScreenId(id) {
  return typeof id === 'string' && id.endsWith('-screen');
}

// ---Helpers ---

function getNewParticipant(participant) {
  const id = getId(participant);

  const { local } = participant;
  const { audio, video } = participant.tracks;

  return {
    camMutedByHost: video?.off?.byRemoteRequest,
    hasNameSet: !!participant.user_name,
    id,
    user_id: participant.user_id,
    isActiveSpeaker: false,
    isCamMuted:
      video?.state === DEVICE_STATE_OFF ||
      video?.state === DEVICE_STATE_BLOCKED,
    isLoading:
      audio?.state === DEVICE_STATE_LOADING ||
      video?.state === DEVICE_STATE_LOADING,
    isLocal: local,
    isMicMuted:
      audio?.state === DEVICE_STATE_OFF ||
      audio?.state === DEVICE_STATE_BLOCKED,
    isOwner: !!participant.owner,
    isRecording: !!participant.record,
    isScreenshare: false,
    lastActiveDate: null,
    micMutedByHost: audio?.off?.byRemoteRequest,
    name: participant.user_name,
  };
}

function getUpdatedParticipant(participant, participants) {
  const id = getId(participant);
  const prevItem = participants.find((p) => p.id === id);

  // In case we haven't set up this participant, yet.
  if (!prevItem) return getNewParticipant(participant);

  const { local } = participant;
  const { audio, video } = participant.tracks;
  return {
    ...prevItem,
    camMutedByHost: video?.off?.byRemoteRequest,
    hasNameSet: !!participant.user_name,
    id,
    user_id: participant.user_id,
    isCamMuted:
      video?.state === DEVICE_STATE_OFF ||
      video?.state === DEVICE_STATE_BLOCKED,
    isLoading:
      audio?.state === DEVICE_STATE_LOADING ||
      video?.state === DEVICE_STATE_LOADING,
    isLocal: local,
    isMicMuted:
      audio?.state === DEVICE_STATE_OFF ||
      audio?.state === DEVICE_STATE_BLOCKED,
    isOwner: !!participant.owner,
    isRecording: !!participant.record,
    micMutedByHost: audio?.off?.byRemoteRequest,
    name: participant.user_name,
  };
}

function getScreenItem(participant) {
  const id = getId(participant);
  return {
    hasNameSet: null,
    id: getScreenId(id),
    isLoading: false,
    isLocal: participant.local,
    isScreenshare: true,
    lastActiveDate: null,
    name: participant.user_name,
  };
}

// --- Actions ---

const ACTIVE_SPEAKER = 'ACTIVE_SPEAKER';
const PARTICIPANT_JOINED = 'PARTICIPANT_JOINED';
const PARTICIPANT_UPDATED = 'PARTICIPANT_UPDATED';
const PARTICIPANT_LEFT = 'PARTICIPANT_LEFT';
const SWAP_POSITION = 'SWAP_POSITION';

// --- Reducer --

function participantsReducer(prevState, action) {
  switch (action.type) {
    case ACTIVE_SPEAKER: {
      const { participants, ...state } = prevState;
      if (!action.id)
        return {
          ...prevState,
          lastPendingUnknownActiveSpeaker: null,
        };
      const date = new Date();
      const isParticipantKnown = participants.some((p) => p.id === action.id);
      return {
        ...state,
        lastPendingUnknownActiveSpeaker: isParticipantKnown
          ? null
          : {
              date,
              id: action.id,
            },
        participants: participants.map((p) => ({
          ...p,
          isActiveSpeaker: p.id === action.id,
          lastActiveDate: p.id === action.id ? date : p?.lastActiveDate,
        })),
      };
    }
    case PARTICIPANT_JOINED: {
      const item = getNewParticipant(action.participant);

      const participants = [...prevState.participants];
      const screens = [...prevState.screens];

      const isPendingActiveSpeaker =
        item.id === prevState.lastPendingUnknownActiveSpeaker?.id;
      if (isPendingActiveSpeaker) {
        item.isActiveSpeaker = true;
        item.lastActiveDate = prevState.lastPendingUnknownActiveSpeaker?.date;
      }

      if (item.isCamMuted) {
        participants.push(item);
      } else {
        const firstInactiveCamOffIndex = prevState.participants.findIndex(
          (p) => p.isCamMuted && !p.isLocal && !p.isActiveSpeaker
        );
        if (firstInactiveCamOffIndex >= 0) {
          participants.splice(firstInactiveCamOffIndex, 0, item);
        } else {
          participants.push(item);
        }
      }

      // Participant is sharing screen
      if (action.participant.screen) {
        screens.push(getScreenItem(action.participant));
      }

      return {
        ...prevState,
        lastPendingUnknownActiveSpeaker: isPendingActiveSpeaker
          ? null
          : prevState.lastPendingUnknownActiveSpeaker,
        participants,
        screens,
      };
    }
    case PARTICIPANT_UPDATED: {
      const item = getUpdatedParticipant(
        action.participant,
        prevState.participants
      );
      const { id } = item;
      const screenId = getScreenId(id);

      const participants = [...prevState.participants];
      const idx = participants.findIndex((p) => p.id === id);
      participants[idx] = item;

      const screens = [...prevState.screens];
      const screenIdx = screens.findIndex((s) => s.id === screenId);

      if (action.participant.screen) {
        const screenItem = getScreenItem(action.participant);
        if (screenIdx >= 0) {
          screens[screenIdx] = screenItem;
        } else {
          screens.push(screenItem);
        }
      } else if (screenIdx >= 0) {
        screens.splice(screenIdx, 1);
      }

      const newState = {
        ...prevState,
        participants,
        screens,
      };

      if (fasteq(newState, prevState)) {
        return prevState;
      }

      return newState;
    }
    case PARTICIPANT_LEFT: {
      const id = getId(action.participant);
      const screenId = getScreenId(id);

      return {
        ...prevState,
        participants: [...prevState.participants].filter((p) => p.id !== id),
        screens: [...prevState.screens].filter((s) => s.id !== screenId),
      };
    }
    case SWAP_POSITION: {
      const participants = [...prevState.participants];
      if (!action.id1 || !action.id2) return prevState;
      const idx1 = participants.findIndex((p) => p.id === action.id1);
      const idx2 = participants.findIndex((p) => p.id === action.id2);
      if (idx1 === -1 || idx2 === -1) return prevState;
      const tmp = participants[idx1];
      participants[idx1] = participants[idx2];
      participants[idx2] = tmp;
      return {
        ...prevState,
        participants,
      };
    }
    default:
      throw new Error();
  }
}

export {
  ACTIVE_SPEAKER,
  getId,
  getScreenId,
  isLocalId,
  isScreenId,
  participantsReducer,
  initialParticipantsState,
  PARTICIPANT_JOINED,
  PARTICIPANT_LEFT,
  PARTICIPANT_UPDATED,
  SWAP_POSITION,
};
