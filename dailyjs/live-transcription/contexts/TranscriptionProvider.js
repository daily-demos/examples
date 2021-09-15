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

  const handleNewMessage = useCallback(
    (e) => {
      if (e.fromId === 'transcription' && e.data?.is_final) {
        console.log(`${JSON.stringify(e.data)}: ${JSON.stringify(callObject.participants())}`)

      const sender = e.data.user_name 
        ? e.data.user_name
        : 'Guest';

        
        setTranscriptionHistory((oldState) => [
          ...oldState,
          { sender, message: e.data.text, id: nanoid() },
        ]);
      }

      setHasNewMessages(true);
    },
    [callObject]
  );

  useEffect(() => {
    if (!callObject) {
      return false;
    }

    console.log(`💬 Transcription provider listening for app messages`);

    callObject.on('app-message', handleNewMessage);

    return () => callObject.off('app-message', handleNewMessage);
  }, [callObject, handleNewMessage]);

  return (
    <TranscriptionContext.Provider
      value={{
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
