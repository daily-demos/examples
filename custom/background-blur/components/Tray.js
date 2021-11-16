import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconBackgroundBlur } from '@custom/shared/icons/blur-md.svg';

import { BACKGROUND_BLUR_MODAL } from './BackgroundBlurModal';

export const Tray = () => {
  const { openModal } = useUIState();

  return (
    <TrayButton
      label="Blur"
      onClick={() => openModal(BACKGROUND_BLUR_MODAL)}
    >
      <IconBackgroundBlur />
    </TrayButton>
  );
};

export default Tray;
