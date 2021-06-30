import { getId, getScreenId } from './participantsState';

const initialTracksState = {
  audioTracks: {},
  videoTracks: {},
  subscriptions: {
    video: {},
  },
};

// --- Actions ---

const TRACK_STARTED = 'TRACK_STARTED';
const TRACK_STOPPED = 'TRACK_STOPPED';
const REMOVE_TRACKS = 'REMOVE_TRACKS';
const UPDATE_SUBSCRIPTIONS = 'UPDATE_SUBSCRIPTIONS';

// --- Reducer and helpers --

function tracksReducer(prevState, action) {
  switch (action.type) {
    case TRACK_STARTED: {
      const id = getId(action.participant);
      const screenId = getScreenId(id);

      if (action.track.kind === 'audio') {
        if (action.participant?.local) {
          // Ignore local audio from mic and screen share
          return prevState;
        }
        const newAudioTracks = {
          [id]: action.participant.tracks.audio,
        };
        if (action.participant.screen) {
          newAudioTracks[screenId] = action.participant.tracks.screenAudio;
        }
        return {
          ...prevState,
          audioTracks: {
            ...prevState.audioTracks,
            ...newAudioTracks,
          },
        };
      }

      const newVideoTracks = {
        [id]: action.participant.tracks.video,
      };
      if (action.participant.screen) {
        newVideoTracks[screenId] = action.participant.tracks.screenVideo;
      }
      return {
        ...prevState,
        videoTracks: {
          ...prevState.videoTracks,
          ...newVideoTracks,
        },
      };
    }
    case TRACK_STOPPED: {
      const { audioTracks, subscriptions, videoTracks } = prevState;

      const newAudioTracks = { ...audioTracks };
      const newSubscriptions = { ...subscriptions };
      const newVideoTracks = { ...videoTracks };

      action.items.forEach(([participant, track]) => {
        const id = participant ? getId(participant) : null;
        const screenId = participant ? getScreenId(id) : null;

        if (track.kind === 'audio') {
          if (!participant?.local) {
            // Ignore local audio from mic and screen share
            newAudioTracks[id] = participant.tracks.audio;
            if (participant.screen) {
              newAudioTracks[screenId] = participant.tracks.screenAudio;
            }
          }
        } else if (track.kind === 'video') {
          newVideoTracks[id] = participant.tracks.video;
          if (participant.screen) {
            newVideoTracks[screenId] = participant.tracks.screenVideo;
          }
        }
      });

      return {
        audioTracks: newAudioTracks,
        subscriptions: newSubscriptions,
        videoTracks: newVideoTracks,
      };
    }

    case REMOVE_TRACKS: {
      const { audioTracks, subscriptions, videoTracks } = prevState;
      const id = getId(action.participant);
      const screenId = getScreenId(id);

      delete audioTracks[id];
      delete audioTracks[screenId];
      delete videoTracks[id];
      delete videoTracks[screenId];

      return {
        audioTracks,
        subscriptions,
        videoTracks,
      };
    }

    case UPDATE_SUBSCRIPTIONS:
      return {
        ...prevState,
        subscriptions: action.subscriptions,
      };

    default:
      throw new Error();
  }
}

export {
  initialTracksState,
  tracksReducer,
  REMOVE_TRACKS,
  TRACK_STARTED,
  TRACK_STOPPED,
  UPDATE_SUBSCRIPTIONS,
};
