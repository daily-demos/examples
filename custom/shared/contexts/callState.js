/**
 * Call State
 * ---
 * Duck file that keeps state of call participants
 */

export const ACTION_PARTICIPANT_JOINED = 'ACTION_PARTICIPANT_JOINED';
export const ACTION_PARTICIPANT_UPDATED = 'ACTION_PARTICIPANT_UPDATED';
export const ACTION_PARTICIPANTED_LEFT = 'ACTION_PARTICIPANT_LEFT';

export const initialCallState = {
  audioTracks: {},
  videoTracks: {},
  callItems: {},
  fatalError: false,
};

export function isLocal(id) {
  return id === 'local';
}

function getCallItems(newParticipants, prevCallItems) {
  const callItems = {};
  const entries = Object.entries(newParticipants);
  entries.forEach(([id, participant]) => {
    const prevState = prevCallItems[id];
    const hasLoaded = !prevState?.isLoading;
    const missingTracks = !(participant.audioTrack || participant.videoTrack);
    const joined = prevState?.joined || new Date().getTime() / 1000;
    const local = isLocal(id);

    callItems[id] = {
      id,
      name: participant.user_name || 'Guest',
      audioTrack: participant.audioTrack,
      videoTrack: participant.videoTrack,
      hasNameSet: !!participant.user_name,
      isActiveSpeaker: !!prevState?.isActiveSpeaker,
      isCamMuted: !participant.video,
      isLoading: !hasLoaded && missingTracks,
      isLocal: local,
      isMicMuted: !participant.audio,
      isOwner: !!participant.owner,
      isRecording: !!participant.record,
      lastActiveDate: prevState?.lastActiveDate ?? null,
      mutedByHost: participant?.tracks?.audio?.off?.byRemoteRequest,
      isScreenshare: false,
      joined,
    };

    if (participant.screenVideoTrack || participant.screenAudioTrack) {
      callItems[`${id}-screen`] = {
        audioTrack: participant.tracks.screenAudio.persistentTrack,
        hasNameSet: null,
        id: `${id}-screen`,
        isLoading: false,
        isLocal: local,
        isScreenshare: true,
        lastActiveDate: prevState?.lastActiveDate ?? null,
        name: participant.user_name,
        videoTrack: participant.screenVideoTrack,
      };
    }
  });
  return callItems;
}

export function isScreenShare(id) {
  return id.endsWith('-screen');
}

export function containsScreenShare(participants) {
  return Object.keys(participants).some((id) => isScreenShare(id));
}

export function callReducer(state, action) {
  switch (action.type) {
    case ACTION_PARTICIPANT_UPDATED:
      return {
        ...state,
        callItems: getCallItems(action.participants, state.callItems),
      };
    default:
      throw new Error();
  }
}
