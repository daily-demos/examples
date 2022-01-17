import React, { useEffect, useState } from 'react';
import Button from '@custom/shared/components/Button';
import { CardBody } from '@custom/shared/components/Card';
import Field from '@custom/shared/components/Field';
import { TextInput, SelectInput } from '@custom/shared/components/Input';
import Modal from '@custom/shared/components/Modal';
import Well from '@custom/shared/components/Well';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { useLiveStreaming } from '../../contexts/LiveStreamingProvider';

export const LIVE_STREAMING_MODAL = 'live-streaming';

const LAYOUTS = [
  { label: 'Grid (default)', value: 'default' },
  { label: 'Single participant', value: 'single-participant' },
  { label: 'Active participant', value: 'active-participant' },
];

export const LiveStreamingModal = () => {
  const { callObject } = useCallState();
  const { allParticipants } = useParticipants();
  const { currentModals, closeModal } = useUIState();
  const { isStreaming, streamError } = useLiveStreaming();
  const [pending, setPending] = useState(false);
  const [rtmpUrl, setRtmpUrl] = useState('');
  const [layout, setLayout] = useState(0);
  const [maxCams, setMaxCams] = useState(9);
  const [participant, setParticipant] = useState(0);

  useEffect(() => {
    // Reset pending state whenever stream state changes
    setPending(false);
  }, [isStreaming]);

  function startLiveStream() {
    setPending(true);

    const opts =
      layout === 'single-participant'
        ? { session_id: participant.id }
        : { max_cam_streams: maxCams };
    callObject.startLiveStreaming({ rtmpUrl, preset: layout, ...opts });
  }

  function stopLiveStreaming() {
    setPending(true);
    callObject.stopLiveStreaming();
  }

  return (
    <Modal
      title="Live streaming"
      isOpen={currentModals[LIVE_STREAMING_MODAL]}
      onClose={() => closeModal(LIVE_STREAMING_MODAL)}
      actions={[
        <Button key="close" fullWidth variant="outline">
          Close
        </Button>,
        !isStreaming ? (
          <Button
            fullWidth
            disabled={!rtmpUrl || pending}
            onClick={() => startLiveStream()}
          >
            {pending ? 'Starting stream...' : 'Start live streaming'}
          </Button>
        ) : (
          <Button
            fullWidth
            variant="warning"
            onClick={() => stopLiveStreaming()}
          >
            Stop live streaming
          </Button>
        ),
      ]}
    >
      <img src="/assets/pattern-ls.svg" className="live-streaming" alt="live streaming" />
      <p>Please note: live streaming requires <b>Scale Plan</b> or above</p>
      {streamError && (
        <Well variant="error">
          Unable to start stream. Error message: {streamError}
        </Well>
      )}
      <CardBody>
        <Field label="Layout">
          <SelectInput
            onChange={(e) => setLayout(Number(e.target.value))}
            value={layout}
          >
            {LAYOUTS.map((l, i) => (
              <option value={i} key={l.value}>
                {l.label}
              </option>
            ))}
          </SelectInput>
        </Field>

        {layout !==
        LAYOUTS.findIndex((l) => l.value === 'single-participant') && (
          <Field label="Additional cameras">
            <SelectInput
              onChange={(e) => setMaxCams(Number(e.target.value))}
              value={maxCams}
            >
              <option value={9}>9 cameras</option>
              <option value={8}>8 cameras</option>
              <option value={7}>7 cameras</option>
              <option value={6}>6 cameras</option>
              <option value={5}>5 cameras</option>
              <option value={4}>4 cameras</option>
              <option value={3}>3 cameras</option>
              <option value={2}>2 cameras</option>
              <option value={1}>1 camera</option>
            </SelectInput>
          </Field>
        )}

        {layout ===
        LAYOUTS.findIndex((l) => l.value === 'single-participant') && (
          <Field label="Select participant">
            <SelectInput
              onChange={(e) => setParticipant(e.target.value)}
              value={participant}
            >
              {allParticipants.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name}
                </option>
              ))}
            </SelectInput>
          </Field>
        )}

        <Field label="Enter RTMP endpoint">
          <TextInput
            type="text"
            placeholder="RTMP URL"
            required
            onChange={(e) => setRtmpUrl(e.target.value)}
          />
        </Field>
      </CardBody>
      <style jsx>{`
        .live-streaming {
          display: flex;
          width: 100%;
          justify-content: center;
        }
      `}</style>
    </Modal>
  );
};

export default LiveStreamingModal;