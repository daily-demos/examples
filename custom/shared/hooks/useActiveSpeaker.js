import {
  useActiveParticipant,
  useLocalParticipant,
  useParticipantIds,
} from '@daily-co/daily-react-hooks';

import { useCallState } from '../contexts/CallProvider';

/**
 * Convenience hook to contain all logic on determining the active speaker
 * (= the current one and only actively speaking person)
 */
export const useActiveSpeaker = () => {
  const { broadcastRole, showLocalVideo } = useCallState();
  const participantIds = useParticipantIds();
  const activeParticipant = useActiveParticipant();
  const localParticipant = useLocalParticipant();

  // we don't show active speaker indicators EVER in a 1:1 call or when the user is alone in-call
  if (broadcastRole !== 'attendee' && participantIds.length <= 2) return null;

  if (activeParticipant?.audio) {
    return activeParticipant?.session_id;
  }

  /**
   * When the local video is displayed and the last known active speaker
   * is muted, we can only fall back to the local participant.
   */
  return !localParticipant?.audio || !showLocalVideo
    ? null
    : localParticipant?.session_id;
};
