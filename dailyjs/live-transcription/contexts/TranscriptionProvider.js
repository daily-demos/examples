import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import { nanoid } from 'nanoid';
import PropTypes from 'prop-types';

export const TranscriptionContext = createContext();

export const TranscriptionProvider = ({ children }) => {
  const { callObject } = useCallState();
  const [transcriptionHistory, setTranscriptionHistory] = useState([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleNewMessage = useCallback(
    (e) => {
      const participants = callObject.participants();
      // Collect only transcription messages, and gather enough
      // words to be able to post messages at sentence intervals
      if (e.fromId === 'transcription' && e.data?.is_final) {

      // Get the sender's current display name or the local name
      const sender = e.data?.session_id !== participants.local.session_id
        ? participants[e.data.session_id].user_name
        : participants.local.user_name;
        
        setTranscriptionHistory((oldState) => [
          ...oldState,
          { sender, message: e.data.text, id: nanoid() },
        ]);
      }

      setHasNewMessages(true);
    },
    [callObject]
  );

  const handleTranscriptionStarted = useCallback(() => {
    console.log('💬 Live stream started');
    setIsTranscribing(true);
  }, []);

  const handleTranscriptionStopped = useCallback(() => {
    console.log('💬 Live stream stopped');
    setIsTranscribing(false);
  }, []);

  useEffect(() => {
    if (!callObject) {
      return false;
    }

    console.log(`💬 Transcription provider listening for app messages`);

    callObject.on('app-message', handleNewMessage);

    callObject.on('transcription-started', handleTranscriptionStarted);
    callObject.on('transcription-stopped', handleTranscriptionStopped);

    return () => callObject.off('app-message', handleNewMessage);
  }, [callObject, handleNewMessage, handleTranscriptionStarted, handleTranscriptionStopped]);

  return (
    <TranscriptionContext.Provider
      value={{
        isTranscribing,
        transcriptionHistory,
        hasNewMessages,
        setHasNewMessages,
      }}
    >
      {children}
    </TranscriptionContext.Provider>
  );
};

TranscriptionProvider.propTypes = {
  children: PropTypes.node,
};

export const useTranscription = () => useContext(TranscriptionContext);
