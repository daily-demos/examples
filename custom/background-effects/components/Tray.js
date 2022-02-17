import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconBackgroundEffects } from '@custom/shared/icons/effects-md.svg';

import { BACKGROUND_EFFECTS_MODAL } from './BackgroundEffectsModal';

export const Tray = () => {
  const { openModal } = useUIState();

  return (
    <TrayButton
      label="Effects"
      onClick={() => openModal(BACKGROUND_EFFECTS_MODAL)}
    >
      <IconBackgroundEffects />
    </TrayButton>
  );
};

export default Tray;
