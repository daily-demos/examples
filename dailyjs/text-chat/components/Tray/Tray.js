import React from 'react';

import { TrayButton } from '@dailyjs/shared/components/Tray';
import { ReactComponent as IconChat } from '@dailyjs/shared/icons/chat-md.svg';

export const Tray = () => (
  <>
    <TrayButton label="Chat">
      <IconChat />
    </TrayButton>
  </>
);

export default Tray;
