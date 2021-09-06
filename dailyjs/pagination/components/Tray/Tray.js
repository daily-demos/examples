import React from 'react';

import { TrayButton } from '@dailyjs/shared/components/Tray';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import { ReactComponent as IconAdd } from '@dailyjs/shared/icons/add-md.svg';

export const Tray = () => {
  const { callObject } = useCallState();

  return (
    <>
      <TrayButton
        label="Add Fake"
        onClick={() => {
          callObject.addFakeParticipant();
        }}
      >
        <IconAdd />
      </TrayButton>
    </>
  );
};

export default Tray;
