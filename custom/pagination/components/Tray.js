import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { ReactComponent as IconAdd } from '@custom/shared/icons/add-md.svg';

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
