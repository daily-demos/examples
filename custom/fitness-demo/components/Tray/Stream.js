import React from 'react';

import { LIVE_STREAMING_MODAL } from '@custom/live-streaming/components/LiveStreamingModal';
import { useLiveStreaming } from '@custom/live-streaming/contexts/LiveStreamingProvider';
import { TrayButton } from '@custom/shared/components/Tray';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconStream } from '@custom/shared/icons/streaming-md.svg';


export const Stream = () => {
  const { openModal } = useUIState();
  const { isStreaming } = useLiveStreaming();
  const { localParticipant } = useParticipants();

  if (!localParticipant.owner) return null;

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