import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import { useDaily, useDailyEvent } from '@daily-co/daily-react-hooks';
import { nanoid } from 'nanoid';
import PropTypes from 'prop-types';

export const TranscriptionContext = createContext();

export const TranscriptionProvider = ({ children }) => {
  const daily = useDaily();
  const [transcriptionHistory, setTranscriptionHistory] = useState([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleNewMessage = useCallback(
    (e) => {
      const participants = daily.participants();
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
    [daily]
  );

  const handleTranscriptionStarted = useCallback(() => {
    console.log('💬 Transcription started');
    setIsTranscribing(true);
  }, []);

  const handleTranscriptionStopped = useCallback(() => {
    console.log('💬 Transcription stopped');
    setIsTranscribing(false);
  }, []);

  const handleTranscriptionError = useCallback(() => {
    console.log('❗ Transcription error!');
    setIsTranscribing(false);
  }, []);

  useDailyEvent('app-message', handleNewMessage);
  useDailyEvent('transcription-started', handleTranscriptionStarted);
  useDailyEvent('transcription-stopped', handleTranscriptionStopped);
  useDailyEvent('transcription-error', handleTranscriptionError);

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
