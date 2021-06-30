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
import {
  DEVICE_STATE_OFF,
  DEVICE_STATE_BLOCKED,
  DEVICE_STATE_LOADING,
} from './useDevices';

const initialParticipantsState = {
  participants: {
    local: {
      camMutedByHost: false,
      hasNameSet: false,
      id: 'local',
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
      position: 1,
    },
  },
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

function getMaxPosition(participants) {
  return Math.max(
    1,
    Math.max(...Object.values(participants).map(({ position }) => position))
  );
}

function getUpdatedParticipant(participant, participants) {
  const id = getId(participant);
  const prevItem = participants[id];

  const { local } = participant;
  const { audio, video } = participant.tracks;

  return {
    ...prevItem,
    camMutedByHost: video?.off?.byRemoteRequest,
    hasNameSet: !!participant.user_name,
    id,
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

function getNewParticipant(participant, participants) {
  const id = getId(participant);

  const { local } = participant;
  const { audio, video } = participant.tracks;

  return {
    camMutedByHost: video?.off?.byRemoteRequest,
    hasNameSet: !!participant.user_name,
    id,
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
    position: local ? 0 : getMaxPosition(participants) + 1,
  };
}

function getScreenItem(participant, participants) {
  const id = getId(participant);
  return {
    hasNameSet: null,
    id: getScreenId(id),
    isLoading: false,
    isLocal: participant.local,
    isScreenshare: true,
    lastActiveDate: null,
    name: participant.user_name,
    position: getMaxPosition(participants) + 1,
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
      if (!action.id) return prevState;
      return {
        ...state,
        participants: Object.keys(participants).reduce(
          (items, id) => ({
            ...items,
            [id]: {
              ...participants[id],
              isActiveSpeaker: id === action.id,
              lastActiveDate:
                id === action.id
                  ? new Date()
                  : participants[id]?.lastActiveDate,
            },
          }),
          {}
        ),
      };
    }
    case PARTICIPANT_JOINED: {
      const item = getNewParticipant(
        action.participant,
        prevState.participants
      );
      const { id } = item;
      const screenId = getScreenId(id);

      const newParticipants = {
        ...prevState.participants,
        [id]: item,
      };

      // Participant is sharing screen
      if (action.participant.screen) {
        newParticipants[screenId] = getScreenItem(
          action.participant,
          newParticipants
        );
      }

      return {
        ...prevState,
        participants: newParticipants,
      };
    }
    case PARTICIPANT_UPDATED: {
      const item = getUpdatedParticipant(
        action.participant,
        prevState.participants
      );
      const { id } = item;
      const screenId = getScreenId(id);

      const newParticipants = {
        ...prevState.participants,
      };
      newParticipants[id] = item;

      if (action.participant.screen) {
        newParticipants[screenId] = getScreenItem(
          action.participant,
          newParticipants
        );
      } else {
        delete newParticipants[screenId];
      }

      return {
        ...prevState,
        participants: newParticipants,
      };
    }
    case PARTICIPANT_LEFT: {
      const id = getId(action.participant);
      const screenId = getScreenId(id);
      const { ...participants } = prevState.participants;
      delete participants[id];
      delete participants[screenId];
      return {
        ...prevState,
        participants,
      };
    }
    case SWAP_POSITION: {
      const { participants, ...state } = prevState;
      if (!action.id1 || !action.id2) return prevState;
      const pos1 = participants[action.id1]?.position;
      const pos2 = participants[action.id2]?.position;
      if (!pos1 || !pos2) return prevState;
      return {
        ...state,
        participants: Object.keys(participants).reduce((items, id) => {
          let { position } = participants[id];
          if (action.id1 === id) {
            position = pos2;
          }
          if (action.id2 === id) {
            position = pos1;
          }
          return {
            ...items,
            [id]: {
              ...participants[id],
              position,
            },
          };
        }, {}),
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
