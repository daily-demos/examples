import React, { useEffect, useRef, useState } from 'react';
import { Aside } from '@custom/shared/components/Aside';
import Button from '@custom/shared/components/Button';
import { TextInput } from '@custom/shared/components/Input';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { useMessageSound } from '@custom/text-chat/hooks/useMessageSound';
import { useChat } from '../contexts/ChatProvider';

export const CHAT_ASIDE = 'chat';

export const ChatAside = () => {
  const { showAside, setShowAside } = useUIState();
  const { sendMessage, chatHistory, hasNewMessages, setHasNewMessages } =
    useChat();
  const { localParticipant } = useParticipants();
  const [newMessage, setNewMessage] = useState('');
  const playMessageSound = useMessageSound();

  const chatWindowRef = useRef();

  useEffect(() => {
    // Clear out any new message notifications if we're showing the chat screen
    if (showAside === CHAT_ASIDE) {
      setHasNewMessages(false);
    }
  }, [showAside, chatHistory.length, setHasNewMessages]);

  useEffect(() => {
    if (hasNewMessages && showAside !== CHAT_ASIDE) {
      playMessageSound();
    }
  }, [playMessageSound, showAside, hasNewMessages]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatHistory?.length]);

  const isLocalUser = (id) => id === localParticipant.user_id;

  if (!showAside || showAside !== CHAT_ASIDE) {
    return null;
  }

  return (
    <Aside onClose={() => setShowAside(false)}>
      <div className="messages-container" ref={chatWindowRef}>
        {chatHistory.map((chatItem) => (
          <div
            className={isLocalUser(chatItem.senderID) ? 'message local' : 'message'}
            key={chatItem.id}
          >
            <span className="content">{chatItem.message}</span>
            <span className="sender">{chatItem.sender}</span>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => {
        e.preventDefault();
        sendMessage(newMessage);
        setNewMessage('');
      }}>
        <footer className="chat-footer">
          <TextInput
            value={newMessage}
            placeholder="Type message here"
            variant="transparent"
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            className="send-button"
            variant="transparent"
            disabled={!newMessage}
            type="submit"
          >
            Send
          </Button>
        </footer>
      </form>
      <style jsx>{`
        .messages-container {
          flex: 1;
          overflow-y: scroll;
        }

        .message {
          margin: var(--spacing-xxs);
          padding: var(--spacing-xxs);
          background: var(--gray-wash);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
        }

        .message.local {
          background: var(--gray-light);
        }

        .message.local .sender {
          color: var(--primary-dark);
        }

        .content {
          color: var(--text-mid);
          display: block;
        }

        .sender {
          font-weight: var(--weight-medium);
          font-size: 0.75rem;
        }

        .chat-footer {
          flex-flow: row nowrap;
          box-sizing: border-box;
          padding: var(--spacing-xxs) 0;
          display: flex;
          position: relative;
          border-top: 1px solid var(--gray-light);
        }

        .chat-footer :global(.input-container) {
          flex: 1;
        }

        .chat-footer :global(.input-container input) {
          padding-right: 0px;
        }

        .chat-footer :global(.send-button) {
          padding: 0 var(--spacing-xs);
        }
      `}</style>
    </Aside>
  );
};

export default ChatAside;
