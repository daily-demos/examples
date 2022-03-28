import React from 'react';

import { TrayButton } from '@custom/shared/components/Tray';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconStream } from '@custom/shared/icons/streaming-md.svg';

import { useLiveStreaming } from '@daily-co/daily-react-hooks';
import { LIVE_STREAMING_MODAL } from './LiveStreamingModal';

export const Tray = () => {
  const { openModal } = useUIState();
  const { isLiveStreaming } = useLiveStreaming();

  return (
    <TrayButton
      label={isLiveStreaming ? 'Live' : 'Stream'}
      orange={isLiveStreaming}
      onClick={() => openModal(LIVE_STREAMING_MODAL)}
    >
      <IconStream />
    </TrayButton>
  );
};

export default Tray;
