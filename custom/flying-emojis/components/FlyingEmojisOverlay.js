import React, { useEffect, useRef, useCallback } from 'react';
import { useCallState } from '@custom/shared/contexts/CallProvider';

const EMOJI_MAP = {
  fire: '🔥',
  squid: '🦑',
  laugh: '🤣',
};

export const FlyingEmojisOverlay = () => {
  const { callObject } = useCallState();
  const overlayRef = useRef();

  // -- Handlers

  const handleRemoveFlyingEmoji = useCallback((node) => {
    if (!overlayRef.current) return;
    overlayRef.current.removeChild(node);
  }, []);

  const handleDisplayFlyingEmoji = useCallback(
    (emoji) => {
      if (!overlayRef.current) {
        return;
      }

      console.log(`⭐ Displaying flying emoji: ${emoji}`);

      const node = document.createElement('div');
      node.appendChild(document.createTextNode(EMOJI_MAP[emoji]));
      node.className =
        Math.random() * 1 > 0.5 ? 'emoji wiggle-1' : 'emoji wiggle-2';
      node.style.transform = `rotate(${-30 + Math.random() * 60}deg)`;
      node.style.left = `${Math.random() * 100}%`;
      node.src = '';
      overlayRef.current.appendChild(node);

      node.addEventListener('animationend', (e) =>
        handleRemoveFlyingEmoji(e.target)
      );
    },
    [handleRemoveFlyingEmoji]
  );

  const handleReceiveFlyingEmoji = useCallback(
    (e) => {
      if (!overlayRef.current) {
        return;
      }

      console.log(`🚨 New emoji message received: ${e.data.message}`);
      handleDisplayFlyingEmoji(e.data.message);
    },
    [handleDisplayFlyingEmoji]
  );

  // -- Effects

  // Listen for new app messages and show new flying emojis
  useEffect(() => {
    if (!callObject) {
      return false;
    }

    console.log(`⭐ Listening for flying emojis...`);

    callObject.on('app-message', handleReceiveFlyingEmoji);

    return () => callObject.off('app-message', handleReceiveFlyingEmoji);
  }, [callObject, handleReceiveFlyingEmoji]);

  // Listen to window events to show local user emojis and send the emoji to all participants on the call
  useEffect(() => {
    if (!callObject) {
      return false;
    }

    function handleSendFlyingEmoji(e) {
      const { emoji } = e.detail;
      console.log(`⭐ Sending flying emoji: ${emoji}`);

      if (emoji) {
        callObject.sendAppMessage({ message: `${emoji}` }, '*');
        handleDisplayFlyingEmoji(emoji);
      }
    }

    window.addEventListener('reaction_added', handleSendFlyingEmoji);
    return () =>
      window.removeEventListener('reaction_added', handleSendFlyingEmoji);
  }, [callObject, handleDisplayFlyingEmoji]);

  // Remove all event listeners on unmount to prevent console warnings
  useEffect(
    () => () =>
      overlayRef.current?.childNodes.forEach((n) =>
        n.removeEventListener('animationend', handleRemoveFlyingEmoji)
      ),
    [handleRemoveFlyingEmoji]
  );

  return (
    <div className="flying-emojis" ref={overlayRef}>
      <style jsx>{`
        .flying-emojis {
          position: fixed;
          top: 0px;
          bottom: 0px;
          left: 0px;
          right: 0px;
          overflow: hidden;
          pointer-events: none;
          user-select: none;
          z-index: 99;
        }

        .flying-emojis :global(.emoji) {
          position: absolute;
          bottom: 0px;
          left: 50%;
          font-size: 48px;
          line-height: 1;
          width: 48px;
          height: 48px;
        }

        .flying-emojis :global(.emoji.wiggle-1) {
          animation: emerge 3s forwards,
            wiggle-1 1s ease-in-out infinite alternate;
        }

        .flying-emojis :global(.emoji.wiggle-2) {
          animation: emerge 3s forwards,
            wiggle-2 1s ease-in-out infinite alternate;
        }

        @keyframes emerge {
          to {
            bottom: 85%;
            opacity: 0;
          }
        }

        @keyframes wiggle-1 {
          from {
            margin-left: -50px;
          }
          to {
            margin-left: 50px;
          }
        }

        @keyframes wiggle-2 {
          from {
            margin-left: 50px;
          }
          to {
            margin-left: -50px;
          }
        }
      `}</style>
    </div>
  );
};

export default FlyingEmojisOverlay;
