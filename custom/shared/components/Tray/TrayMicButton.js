import React from 'react';
import { TrayButton } from '@custom/shared/components/Tray';
import { ReactComponent as IconMicOff } from '@custom/shared/icons/mic-off-md.svg';
import { ReactComponent as IconMicOn } from '@custom/shared/icons/mic-on-md.svg';

import PropTypes from 'prop-types';

export const TrayMicButton = ({ isMuted, onClick }) => {
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
