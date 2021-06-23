import React, { useEffect, useState } from 'react';
import Aside from '@dailyjs/shared/components/Aside';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import { useChat } from '../../contexts/ChatProvider';

export const CHAT_ASIDE = 'chat';

export const ChatAside = () => {
  const { showAside, setShowAside } = useUIState();
  const { sendMessage, chatHistory, setHasNewMessages } = useChat();
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Clear out any new message otifications if we're showing the chat screen
    if (showAside === CHAT_ASIDE) {
      setHasNewMessages(false);
    }
  }, [showAside, chatHistory.length, setHasNewMessages]);

  if (!showAside || showAside !== CHAT_ASIDE) {
    return null;
  }

  return (
    <Aside onClose={() => setShowAside(false)}>
      {chatHistory.map((chatItem) => (
        <div key={chatItem.id}>
          {chatItem.sender} - {chatItem.message}
        </div>
      ))}
      <hr />
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button
        type="button"
        disabled={!newMessage}
        onClick={() => {
          sendMessage(newMessage);
          setNewMessage('');
        }}
      >
        Send a test message
      </button>
    </Aside>
  );
};

export default ChatAside;
