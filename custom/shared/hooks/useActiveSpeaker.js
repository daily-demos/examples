import { useCallState } from '../contexts/CallProvider';
import { useParticipants } from '../contexts/ParticipantsProvider';

/**
 * Convenience hook to contain all logic on determining the active speaker
 * (= the current one and only actively speaking person)
 */
export const useActiveSpeaker = () => {
  const { showLocalVideo } = useCallState();
  const { activeParticipant, localParticipant, participantCount } =
    useParticipants();

  // we don't show active speaker indicators EVER in a 1:1 call or when the user is alone in-call
  if (participantCount <= 2) return null;

  if (!activeParticipant?.isMicMuted) {
    return activeParticipant?.id;
  }

  /**
   * When the local video is displayed and the last known active speaker
   * is muted, we can only fall back to the local participant.
   */
  return localParticipant?.isMicMuted || !showLocalVideo
    ? null
    : localParticipant?.id;
};

export default useActiveSpeaker;
