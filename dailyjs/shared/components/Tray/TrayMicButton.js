import React from 'react';
import { TrayButton } from '@dailyjs/shared/components/Tray';
import { useAudioLevel } from '@dailyjs/shared/hooks/useAudioLevel';
import { ReactComponent as IconMicOff } from '@dailyjs/shared/icons/mic-off-md.svg';
import { ReactComponent as IconMicOn } from '@dailyjs/shared/icons/mic-on-md.svg';

import PropTypes from 'prop-types';

export const TrayMicButton = ({ isMuted, onClick }) => {
  const audioLevel = useAudioLevel('local');

  return (
    <TrayButton label="Mic" onClick={onClick} orange={isMuted}>
      {isMuted ? <IconMicOff /> : <IconMicOn />}
    </TrayButton>
  );
};

TrayMicButton.propTypes = {
  isMuted: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default TrayMicButton;
