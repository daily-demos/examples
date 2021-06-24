import React, { useEffect, useState } from 'react';
import { Button } from '@dailyjs/shared/components/Button';
import Field from '@dailyjs/shared/components/Field';
import { TextInput } from '@dailyjs/shared/components/Input';
import Modal from '@dailyjs/shared/components/Modal';
import { Well } from '@dailyjs/shared/components/Well';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import { useLiveStreaming } from '../../contexts/LiveStreamingProvider';

export const LIVE_STREAMING_MODAL = 'live-streaming';

export const LiveStreamingModal = () => {
  const { callObject } = useCallState();
  const { currentModals, closeModal } = useUIState();
  const { isStreaming, streamError } = useLiveStreaming();
  const [pending, setPending] = useState(false);
  const [rtmpUrl, setRtmpUrl] = useState('');

  useEffect(() => {
    // Reset pending state whenever stream state changes
    setPending(false);
  }, [isStreaming]);

  function startLiveStream() {
    setPending(true);
    callObject.startLiveStreaming({ rtmpUrl });
  }

  function stopLiveStreaming() {
    setPending(true);
    callObject.stopLiveStreaming();
  }

  return (
    <Modal
      title="Live stream"
      isOpen={currentModals[LIVE_STREAMING_MODAL]}
      onClose={() => closeModal(LIVE_STREAMING_MODAL)}
    >
      {streamError && (
        <Well variant="error">
          Unable to start stream. Error message: {streamError}
        </Well>
      )}
      <Field label="Enter RTMP endpoint">
        <TextInput
          type="text"
          placeholder="RTMP URL"
          required
          onChange={(e) => setRtmpUrl(e.target.value)}
        />
      </Field>
      {!isStreaming ? (
        <Button
          disabled={!rtmpUrl || pending}
          onClick={() => startLiveStream()}
        >
          {pending ? 'Starting stream...' : 'Start live streaming'}
        </Button>
      ) : (
        <Button variant="warning" onClick={() => stopLiveStreaming()}>
          Stop live streaming
        </Button>
      )}
    </Modal>
  );
};

export default LiveStreamingModal;
