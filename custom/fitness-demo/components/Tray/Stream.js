import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconStream } from '@custom/shared/icons/streaming-md.svg';

import { useLiveStreaming } from '../../contexts/LiveStreamingProvider';
import { LIVE_STREAMING_MODAL } from '../Modals/LiveStreamingModal';

export const Stream = () => {
  const { openModal } = useUIState();
  const { isStreaming } = useLiveStreaming();
  const { localParticipant } = useParticipants();

  if (!localParticipant.isOwner) return null;

  return (
    <TrayButton
      label={isStreaming ? 'Live' : 'Stream'}
      orange={isStreaming}
      onClick={() => openModal(LIVE_STREAMING_MODAL)}
    >
      <IconStream />
    </TrayButton>
  );
};

export default Stream;