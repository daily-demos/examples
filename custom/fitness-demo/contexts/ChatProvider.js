import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { nanoid } from 'nanoid';
import PropTypes from 'prop-types';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { callObject } = useCallState();
  const [chatHistory, setChatHistory] = useState([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const handleNewMessage = useCallback(
    (e) => {
      if (e?.data?.message?.type) return;
      const participants = callObject.participants();
      const sender = participants[e.fromId].user_name
        ? participants[e.fromId].user_name
        : 'Guest';

      setChatHistory((oldState) => [
        ...oldState,
        { sender, message: e.data.message, id: nanoid() },
      ]);

      setHasNewMessages(true);
    },
    [callObject]
  );

  const sendMessage = useCallback(
    (message) => {
      if (!callObject) {
        return false;
      }

      console.log('💬 Sending app message');

      callObject.sendAppMessage({ message }, '*');

      // Get the sender (local participant) name
      const sender = callObject.participants().local.user_name
        ? callObject.participants().local.user_name
        : 'Guest';

      // Update local chat history
      return setChatHistory((oldState) => [
        ...oldState,
        { sender, message, id: nanoid(), isLocal: true },
      ]);
    },
    [callObject]
  );

  useEffect(() => {
    if (!callObject) {
      return false;
    }

    console.log(`💬 Chat provider listening for app messages`);

    callObject.on('app-message', handleNewMessage);

    return () => callObject.off('app-message', handleNewMessage);
  }, [callObject, handleNewMessage]);

  return (
    <ChatContext.Provider
      value={{
        sendMessage,
        chatHistory,
        hasNewMessages,
        setHasNewMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node,
};

export const useChat = () => useContext(ChatContext);