import React, { useMemo } from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useCallConfig } from '@custom/shared/hooks/useCallConfig';
import { ReactComponent as IconShare } from '@custom/shared/icons/share-sm.svg';

const MAX_SCREEN_SHARES = 2;

export const ScreenShareTray = () => {
  const { enableScreenShare } = useCallConfig();
  const { callObject } = useCallState();
  const { screens, participantIds, isOwner } = useParticipants();

  const isSharingScreen = useMemo(
    () => screens.some((s) => s.local),
    [screens]
  );

  const screensLength = useMemo(() => screens.length, [screens]);

  const toggleScreenShare = () =>
    isSharingScreen
      ? callObject.stopScreenShare()
      : callObject.startScreenShare();

  const disabled =
    participantIds.length &&
    screensLength >= MAX_SCREEN_SHARES &&
    !isSharingScreen;

  if (!enableScreenShare) return null;
  if (!isOwner) return null;

  return (
    <TrayButton
      label={isSharingScreen ? 'Stop' : 'Share'}
      orange={isSharingScreen}
      disabled={disabled}
      onClick={toggleScreenShare}
    >
      <IconShare />
    </TrayButton>
  );
};

export default ScreenShareTray;
