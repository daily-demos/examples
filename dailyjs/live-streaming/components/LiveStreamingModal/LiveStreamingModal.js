import React, { useState } from 'react';
import { Button } from '@dailyjs/shared/components/Button';
import Field from '@dailyjs/shared/components/Field';
import { TextInput } from '@dailyjs/shared/components/Input';
import Modal from '@dailyjs/shared/components/Modal';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';

export const LIVE_STREAMING_MODAL = 'live-streaming';

export const LiveStreamingModal = () => {
  const { callObject } = useCallState();
  const { currentModals, closeModal } = useUIState();
  const [rtmpUrl, setRtmpUrl] = useState('');

  return (
    <Modal
      title="Live stream"
      isOpen={currentModals[LIVE_STREAMING_MODAL]}
      onClose={() => closeModal(LIVE_STREAMING_MODAL)}
    >
      <Field label="Enter room to join">
        <TextInput
          type="text"
          placeholder="RTMP URL"
          required
          onChange={(e) => setRtmpUrl(e.target.value)}
        />
      </Field>
      <Button
        disabled={!rtmpUrl}
        onClick={() => callObject.startLiveStreaming({ rtmpUrl })}
      >
        Start live streaming
      </Button>
      <Button onClick={() => callObject.stopLiveStreaming()}>
        Stop live streaming
      </Button>
    </Modal>
  );
};

export default LiveStreamingModal;
