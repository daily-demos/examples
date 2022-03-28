import React, { useEffect, useState } from 'react';
import Button from '@custom/shared/components/Button';
import { CardBody } from '@custom/shared/components/Card';
import Field from '@custom/shared/components/Field';
import { TextInput, SelectInput } from '@custom/shared/components/Input';
import Modal from '@custom/shared/components/Modal';
import Well from '@custom/shared/components/Well';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { useParticipant } from '@daily-co/daily-react-hooks';
import { useLiveStreaming } from '../contexts/LiveStreamingProvider';

export const LIVE_STREAMING_MODAL = 'live-streaming';

const LAYOUTS = [
  { label: 'Grid (default)', value: 'default' },
  { label: 'Single participant', value: 'single-participant' },
  { label: 'Active participant', value: 'active-participant' },
];

const ParticipantOption = ({ sessionId }) => {
  const participant = useParticipant(sessionId);

  return (
    <option value={participant.session_id} key={sessionId}>
      {participant.user_name}
    </option>
  );
};

export const LiveStreamingModal = () => {
  const { participantIds } = useParticipants();
  const { currentModals, closeModal } = useUIState();
  const { isLiveStreaming, errorMsg, startLiveStreaming, stopLiveStreaming } =
    useLiveStreaming();

  const [pending, setPending] = useState(false);
  const [rtmpUrl, setRtmpUrl] = useState('');
  const [layoutType, setLayoutType] = useState('default');
  const [maxCams, setMaxCams] = useState(9);
  const [participantId, setParticipantId] = useState(0);

  useEffect(() => {
    // Reset pending state whenever stream state changes
    setPending(false);
  }, [isLiveStreaming]);

  function startLiveStream() {
    setPending(true);

    const config = {
      rtmpUrl,
      layout: {
        preset: layoutType,
      },
    };

    if (layoutType === 'single-participant')
      config.layout.session_id = participantId;
    else if (layoutType === 'default') config.layout.max_cam_streams = maxCams;

    startLiveStreaming(config);
  }

  function stopLiveStream() {
    setPending(true);
    stopLiveStreaming();
  }

  return (
    <Modal
      title="Live stream"
      isOpen={currentModals[LIVE_STREAMING_MODAL]}
      onClose={() => closeModal(LIVE_STREAMING_MODAL)}
      actions={[
        <Button key="close" fullWidth variant="outline">
          Close
        </Button>,
        !isLiveStreaming ? (
          <Button
            fullWidth
            disabled={!rtmpUrl || pending}
            onClick={() => startLiveStream()}
          >
            {pending ? 'Starting stream...' : 'Start live streaming'}
          </Button>
        ) : (
          <Button fullWidth variant="warning" onClick={() => stopLiveStream()}>
            Stop live streaming
          </Button>
        ),
      ]}
    >
      {errorMsg && (
        <Well variant="error">
          Unable to start stream. Error message: {errorMsg}
        </Well>
      )}
      <CardBody>
        <Field label="Layout">
          <SelectInput
            onChange={(e) => setLayoutType(e.target.value)}
            value={layoutType}
          >
            {LAYOUTS.map((l) => (
              <option value={l.value} key={l.value}>
                {l.label}
              </option>
            ))}
          </SelectInput>
        </Field>

        {layoutType === 'default' && (
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

        {layoutType === 'single-participant' && (
          <Field label="Select participant">
            <SelectInput
              onChange={(e) => setParticipantId(e.target.value)}
              value={participantId}
            >
              <option value={0} disabled>
                Select
              </option>
              {participantIds.map((p) => (
                <ParticipantOption sessionId={p} key={p} />
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
