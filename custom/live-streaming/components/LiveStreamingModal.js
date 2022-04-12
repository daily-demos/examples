import React, { useEffect, useState } from 'react';
import Button from '@custom/shared/components/Button';
import { CardBody } from '@custom/shared/components/Card';
import Field from '@custom/shared/components/Field';
import { TextInput, SelectInput } from '@custom/shared/components/Input';
import Modal from '@custom/shared/components/Modal';
import Well from '@custom/shared/components/Well';
import { useLiveStreaming } from '@custom/shared/contexts/LiveStreamingProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';

export const LIVE_STREAMING_MODAL = 'live-streaming';

const LAYOUTS = [
  { label: 'Grid (default)', value: 'default' },
  { label: 'Single participant', value: 'single-participant' },
  { label: 'Active participant', value: 'active-participant' },
];

export const LiveStreamingModal = () => {
  const { participants } = useParticipants();
  const { currentModals, closeModal } = useUIState();
  const {
    isStreaming,
    streamError,
    startLiveStreaming,
    stopLiveStreaming,
  } = useLiveStreaming();
  const [pending, setPending] = useState(false);
  const [rtmpUrl, setRtmpUrl] = useState('');
  const [layoutType, setLayoutType] = useState('default');
  const [maxCams, setMaxCams] = useState(9);
  const [participantId, setParticipantId] = useState(0);

  useEffect(() => {
    // Reset pending state whenever stream state changes
    setPending(false);
  }, [isStreaming]);

  function startLiveStream() {
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

  const handleRMTPURLChange = (e) => setRtmpUrl(e.target.value);
  const handleSelectLayoutInputChange = (e) => setLayoutType(e.target.value);
  const handleSelectParticipantInputChange = (e) => setParticipantId(e.target.value);
  const handleSelectMaxCamsInputChange = (e) => setMaxCams(e.target.valueAsNumber);

  return (
    <Modal
      title="Live stream"
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
            onClick={startLiveStream}
          >
            {pending ? 'Starting stream...' : 'Start live streaming'}
          </Button>
        ) : (
          <Button
            fullWidth
            variant="warning"
            onClick={stopLiveStream}
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
            onChange={handleSelectLayoutInputChange}
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
              onChange={handleSelectMaxCamsInputChange}
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
              onChange={handleSelectParticipantInputChange}
              value={participantId}
            >
              <option value={0} disabled>
                Select
              </option>
              {participants.map((p) => (
                <option value={p.sessionId} key={p.sessionId}>
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
            onChange={handleRMTPURLChange}
          />
          <a
            className="learn-more"
            href="https://docs.daily.co/guides/paid-features/live-streaming-with-daily"
          >
            Want to learn more about RTMP url?
          </a>
        </Field>
      </CardBody>
    </Modal>
  );
};

export default LiveStreamingModal;
