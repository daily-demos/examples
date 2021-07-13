import React, { useEffect, useState } from 'react';

import Button from '@dailyjs/shared/components/Button';
import { TrayButton } from '@dailyjs/shared/components/Tray';
import { ReactComponent as IconStar } from '@dailyjs/shared/icons/star-md.svg';

export const Tray = () => {
  const [showEmojis, setShowEmojis] = useState(false);

  function sendEmoji(emoji) {
    // Dispatch custom event here so the local user can see their own emoji
    window.dispatchEvent(
      new CustomEvent('reaction_added', { detail: { emoji } })
    );
    setShowEmojis(false);
  }

  return (
    <div>
      {showEmojis && (
        <div className="emojis">
          <Button
            variant="outline-gray"
            size="small-square"
            onClick={() => sendEmoji('fire')}
          >
            🔥
          </Button>
          <Button
            variant="outline-gray"
            size="small-square"
            onClick={() => sendEmoji('squid')}
          >
            🦑
          </Button>
          <Button
            variant="outline-gray"
            size="small-square"
            onClick={() => sendEmoji('laugh')}
          >
            🤣
          </Button>
        </div>
      )}
      <TrayButton label="Emoji" onClick={() => setShowEmojis(!showEmojis)}>
        <IconStar />
      </TrayButton>
      <style jsx>{`
        position: relative;

        .emojis {
          position: absolute;
          display: flex;
          top: calc(-100% + var(--spacing-xs));
          left: 0px;
          transform: translateX(calc(-50% + 26px));
          z-index: 99;
          background: white;
          padding: var(--spacing-xxxs);
          column-gap: 5px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-depth-2);
        }
      `}</style>
    </div>
  );
};

export default Tray;
