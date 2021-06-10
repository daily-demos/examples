import { getId, getScreenId } from './participantsState';

const initialTracksState = {
  audioTracks: {},
  videoTracks: {},
};

// --- Actions ---

const TRACK_STARTED = 'TRACK_STARTED';
const TRACK_STOPPED = 'TRACK_STOPPED';
const REMOVE_TRACKS = 'REMOVE_TRACKS';
const UPDATE_TRACKS = 'UPDATE_TRACKS';

// --- Reducer and helpers --

function tracksReducer(prevState, action) {
  switch (action.type) {
    case TRACK_STARTED:
    case TRACK_STOPPED: {
      const id = action.participant ? getId(action.participant) : null;
      const screenId = action.participant ? getScreenId(id) : null;

      if (action.track.kind === 'audio' && !action.participant?.local) {
        // Ignore local audio from mic and screen share
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
    case REMOVE_TRACKS: {
      const { audioTracks, videoTracks } = prevState;
      const id = getId(action.participant);
      const screenId = getScreenId(id);

      delete audioTracks[id];
      delete audioTracks[screenId];
      delete videoTracks[id];
      delete videoTracks[screenId];

      return {
        audioTracks,
        videoTracks,
      };
    }
    case UPDATE_TRACKS: {
      const { audioTracks, videoTracks } = prevState;
      const id = getId(action.participant);
      const screenId = getScreenId(id);

      const newAudioTracks = {
        ...audioTracks,
      };
      const newVideoTracks = {
        ...videoTracks,
        [id]: action.participant.tracks.video,
      };
      if (!action.participant.local) {
        newAudioTracks[id] = action.participant.tracks.audio;
      }
      if (action.participant.screen) {
        newVideoTracks[screenId] = action.participant.tracks.screenVideo;
        if (!action.participant.local) {
          newAudioTracks[screenId] = action.participant.tracks.screenAudio;
        }
      } else {
        delete newAudioTracks[screenId];
        delete newVideoTracks[screenId];
      }

      return {
        audioTracks: newAudioTracks,
        videoTracks: newVideoTracks,
      };
    }
    default:
      throw new Error();
  }
}

export {
  initialTracksState,
  REMOVE_TRACKS,
  TRACK_STARTED,
  TRACK_STOPPED,
  UPDATE_TRACKS,
  tracksReducer,
};
