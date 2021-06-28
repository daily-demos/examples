import React from 'react';

import { TrayButton } from '@dailyjs/shared/components/Tray';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import { ReactComponent as IconStream } from '@dailyjs/shared/icons/streaming-md.svg';

import { useLiveStreaming } from '../../contexts/LiveStreamingProvider';
import { LIVE_STREAMING_MODAL } from '../LiveStreamingModal';

export const Tray = () => {
  const { openModal } = useUIState();
  const { isStreaming } = useLiveStreaming();

  return (
    <>
      <TrayButton
        label={isStreaming ? 'Live' : 'Stream'}
        orange={isStreaming}
        onClick={() => openModal(LIVE_STREAMING_MODAL)}
      >
        <IconStream />
      </TrayButton>
    </>
  );
};

export default Tray;
