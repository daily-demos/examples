import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { ReactComponent as IconAdd } from '@custom/shared/icons/add-md.svg';
import { useBreakoutRoom } from './BreakoutRoomProvider';

export const Tray = () => {
  const { createSession } = useBreakoutRoom();

  return (
    <>
      <TrayButton
        label="Breakout"
        onClick={createSession}>
        <IconAdd />
      </TrayButton>
    </>
  );
};

export default Tray;
