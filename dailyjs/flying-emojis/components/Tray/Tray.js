import React, { useState } from 'react';

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
          <Button onClick={() => sendEmoji('fire')}>A</Button>
          <Button onClick={() => sendEmoji('squid')}>B</Button>
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
          top: -50px;
          z-index: 99;
        }
      `}</style>
    </div>
  );
};

export default Tray;
