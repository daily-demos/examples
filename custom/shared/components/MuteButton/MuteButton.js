import React, { useState } from 'react';
import { ReactComponent as IconCameraOff } from '@custom/shared/icons/camera-off-md.svg';
import { ReactComponent as IconCameraOn } from '@custom/shared/icons/camera-on-md.svg';
import { ReactComponent as IconMicOff } from '@custom/shared/icons/mic-off-md.svg';
import { ReactComponent as IconMicOn } from '@custom/shared/icons/mic-on-md.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useCallState } from '../../contexts/CallProvider';
import Button from '../Button';

export const MuteButton = ({ isMuted, mic = false, className, disabled = false, ...props }) => {
  const { callObject } = useCallState();
  const [muted, setMuted] = useState(!isMuted);

  const toggleDevice = (newState) => {
    if (mic) {
      callObject.setLocalAudio(newState);
    } else {
      callObject.setLocalVideo(newState);
    }

    setMuted(newState);
  };

  const Icon = mic
    ? [<IconMicOff key="mic-off" />, <IconMicOn key="mic-on" />]
    : [<IconCameraOff key="cam-off" />, <IconCameraOn key="cam-on" />];

  if (!callObject) return null;

  const cx = classNames(className, { muted: disabled || !muted });

  return (
    <Button
      size="large-circle"
      variant="blur"
      className={cx}
      disabled={disabled}
      {...props}
      onClick={() => toggleDevice(!muted)}
    >
      {disabled ? Icon[0] : Icon[+muted]}
    </Button>
  );
};

MuteButton.propTypes = {
  isMuted: PropTypes.bool,
  mic: PropTypes.bool,
  className: PropTypes.string,
};

export default MuteButton;
