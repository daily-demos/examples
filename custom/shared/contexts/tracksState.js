import { getId, getScreenId } from './participantsState';

const initialTracksState = {
  audioTracks: {},
  videoTracks: {},
};

// --- Reducer and helpers --

function tracksReducer(
  prevState,
  action
) {
  switch (action.type) {
    case 'TRACK_STARTED': {
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
    case 'TRACKS_STOPPED': {
      const { audioTracks, videoTracks } = prevState;

      const newAudioTracks = { ...audioTracks };
      const newVideoTracks = { ...videoTracks };

      for (const [participant, track] of action.items) {
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
      }

      return {
        audioTracks: newAudioTracks,
        videoTracks: newVideoTracks,
      };
    }
    case 'UPDATE_AUDIO_TRACK': {
      const id = getId(action.participant);
      const screenId = getScreenId(id);
      if (action.participant?.local) {
        // Ignore local audio from mic and screen share
        return prevState;
      }
      const newAudioTracks = {
        ...prevState.audioTracks,
        [id]: action.participant.tracks.audio,
        [screenId]: action.participant.tracks.screenAudio,
      };
      return {
        ...prevState,
        audioTracks: newAudioTracks,
      };
    }
    case 'UPDATE_VIDEO_TRACK': {
      const id = getId(action.participant);
      const newVideoTracks = {
        ...prevState.videoTracks,
        [id]: action.participant.tracks.video,
      };
      return {
        ...prevState,
        videoTracks: newVideoTracks,
      };
    }
    case 'REMOVE_TRACKS': {
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
    default:
      throw new Error();
  }
}

export { initialTracksState, tracksReducer };