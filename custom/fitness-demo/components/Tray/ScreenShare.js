import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useScreenShare } from '@custom/shared/contexts/ScreenShareProvider';
import { ReactComponent as IconShare } from '@custom/shared/icons/share-sm.svg';

export const ScreenShareTray = () => {
  const { enableScreenShare } = useCallState();
  const { localParticipant } = useParticipants();
  const {
    isSharingScreen,
    isDisabled,
    startScreenShare,
    stopScreenShare
  } = useScreenShare();

  const toggleScreenShare = () =>
    isSharingScreen ? stopScreenShare() : startScreenShare();

  if (!enableScreenShare) return null;
  if (!localParticipant.isOwner) return null;

  return (
    <TrayButton
      label={isSharingScreen ? 'Stop': 'Share'}
      orange={isSharingScreen}
      disabled={isDisabled}
      onClick={toggleScreenShare}
    >
      <IconShare />
    </TrayButton>
  );
};

export default ScreenShareTray;
