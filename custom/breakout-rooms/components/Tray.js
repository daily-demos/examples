import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { ReactComponent as IconAdd } from '@custom/shared/icons/add-md.svg';
import useBreakoutRoom from './useBreakoutRoom';

export const Tray = () => {
  const { callObject } = useCallState();
  const { create } = useBreakoutRoom();

  return (
    <>
      <TrayButton
        label="Add Fake"
        onClick={() => callObject.addFakeParticipant()}>
        <IconAdd />
      </TrayButton>
      <TrayButton
        label="Breakout"
        onClick={create}>
        <IconAdd />
      </TrayButton>
    </>
  );
};

export default Tray;
