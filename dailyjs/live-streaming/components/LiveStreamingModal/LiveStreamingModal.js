import React, { useEffect, useState } from 'react';
import { Button } from '@dailyjs/shared/components/Button';
import { CardBody } from '@dailyjs/shared/components/Card';
import Field from '@dailyjs/shared/components/Field';
import { TextInput, SelectInput } from '@dailyjs/shared/components/Input';
import Modal from '@dailyjs/shared/components/Modal';
import { Well } from '@dailyjs/shared/components/Well';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
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
      title="Live stream"
      isOpen={currentModals[LIVE_STREAMING_MODAL]}
      onClose={() => closeModal(LIVE_STREAMING_MODAL)}
      actions={[
        <Button fullWidth variant="outline">
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
    </Modal>
  );
};

export default LiveStreamingModal;
