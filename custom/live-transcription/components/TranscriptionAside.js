import React, { useEffect, useRef, useState } from 'react';
import { Aside } from '@custom/shared/components/Aside';
import Button from '@custom/shared/components/Button';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useTranscription } from '@custom/shared/contexts/TranscriptionProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';

export const TRANSCRIPTION_ASIDE = 'transcription';

export const TranscriptionAside = () => {
  const { callObject } = useCallState();
  const { showAside, setShowAside } = useUIState();
  const { transcriptionHistory } = useTranscription();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { isOwner } = useParticipants();

  const msgWindowRef = useRef();


  useEffect(() => {
    if (msgWindowRef.current) {
      msgWindowRef.current.scrollTop = msgWindowRef.current.scrollHeight;
    }
  }, [transcriptionHistory?.length]);

  if (!showAside || showAside !== TRANSCRIPTION_ASIDE) {
    return null;
  }

  async function startTranscription() {
    setIsTranscribing(true);
    await callObject.startTranscription();
  }

  async function stopTranscription() {
    setIsTranscribing(false);
    await callObject.stopTranscription();
  }

  return (
    <Aside onClose={() => setShowAside(false)}>
        {isOwner && (
          <div className="owner-actions">

            <Button
              fullWidth
              size="tiny"
              disabled={isTranscribing}
              onClick={() =>
                startTranscription()
              }
            >
              {isTranscribing ? 'Transcribing' : 'Start transcribing'}
            </Button>
            <Button
              fullWidth
              size="tiny"
              disabled={!isTranscribing}
              onClick={() =>
                stopTranscription()
              }
            >
              Stop transcribing
            </Button>
          </div>
        )}
      <div className="messages-container" ref={msgWindowRef}>
        {transcriptionHistory.map((msg) => (
          <div key={msg.id}>
            <span className="sender">{msg.sender}: </span>
            <span className="content">{msg.message}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .owner-actions {
          display: flex;
          font-weight: bold;
          align-self: center;
          gap: var(--spacing-xxxs);
          margin: var(--spacing-xs) var(--spacing-xxs);
        }
        .messages-container {
          flex: 1;
          overflow-y: scroll;
          margin-left: var(--spacing-xs);
        }
        .messages-container .sender {
          font-weight: bold;
        }
      `}</style>
    </Aside>
  );
};

export default TranscriptionAside;
