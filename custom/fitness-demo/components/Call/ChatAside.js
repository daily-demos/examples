import React, { useEffect, useRef, useState } from 'react';
import { Aside } from '@custom/shared/components/Aside';
import Button from '@custom/shared/components/Button';
import { TextInput } from '@custom/shared/components/Input';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconEmoji } from '@custom/shared/icons/emoji-sm.svg';
import { useMessageSound } from '@custom/text-chat/hooks/useMessageSound';
import { useChat } from '../../contexts/ChatProvider';
import AsideHeader from '../App/AsideHeader';

export const CHAT_ASIDE = 'chat';

export const ChatAside = () => {
  const { showAside, setShowAside } = useUIState();
  const { sendMessage, chatHistory, hasNewMessages, setHasNewMessages } =
    useChat();
  const [newMessage, setNewMessage] = useState('');
  const playMessageSound = useMessageSound();
  const [showEmojis, setShowEmojis] = useState(false);

  const emojis = ['😍', '😭', '😂', '👋', '🙏'];
  const chatWindowRef = useRef();

  useEffect(() => {
    // Clear out any new message notifications if we're showing the chat screen
    if (showAside === CHAT_ASIDE) {
      setHasNewMessages(false);
    }
  }, [showAside, chatHistory?.length, setHasNewMessages]);

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

  if (!showAside || showAside !== CHAT_ASIDE) {
    return null;
  }

  return (
    <Aside onClose={() => setShowAside(false)}>
      <AsideHeader />
      <div className="messages-container" ref={chatWindowRef}>
        {chatHistory?.map((chatItem) => (
          <div
            className={chatItem.isLocal ? 'message local' : 'message'}
            key={chatItem.id}
          >
            <span className="content">{chatItem.message}</span>
            <span className="sender">{chatItem.sender}</span>
          </div>
        ))}
      </div>
      {showEmojis && (
        <div className="emojis">
          {emojis.map(emoji => (
            <Button
              key={emoji}
              variant="gray"
              size="small-circle"
              onClick={() => sendMessage(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      )}
      <footer className="chat-footer">
        <Button
          variant="gray"
          size="small-circle"
          onClick={() => setShowEmojis(!showEmojis)}
        >
          <IconEmoji />
        </Button>
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
          onClick={() => {
            sendMessage(newMessage);
            setNewMessage('');
          }}
        >
          Send
        </Button>
      </footer>
      <style jsx>{`
        .emojis {
          position: absolute;
          display: flex;
          bottom: var(--spacing-xxl);
          left: 0px;
          transform: translateX(calc(-50% + 26px));
          z-index: 99;
          background: white;
          padding: var(--spacing-xxxs);
          column-gap: 5px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-depth-2);
        }

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
          padding-right: 0;
        }

        .chat-footer :global(.send-button) {
          padding: 0 var(--spacing-xs);
        }
      `}</style>
    </Aside>
  );
};

export default ChatAside;
