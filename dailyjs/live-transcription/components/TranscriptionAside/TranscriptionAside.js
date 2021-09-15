import React, { useEffect, useRef, useState } from 'react';
import Aside from '@dailyjs/shared/components/Aside';
import { Button } from '@dailyjs/shared/components/Button';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import { useTranscription } from '../../contexts/TranscriptionProvider';

export const TRANSCRIPTION_ASIDE = 'transcription';

export const TranscriptionAside = () => {
  const { callObject } = useCallState();
  const { showAside, setShowAside } = useUIState();
  const { _sendMessage, transcriptionHistory } = useTranscription();
  const { _allParticipants, isOwner } = useParticipants();

  const msgWindowRef = useRef();


  useEffect(() => {
    if (msgWindowRef.current) {
      msgWindowRef.current.scrollTop = msgWindowRef.current.scrollHeight;
    }
  }, [transcriptionHistory?.length]);

  if (!showAside || showAside !== TRANSCRIPTION_ASIDE) {
    return null;
  }

  function startTranscription() {
    callObject.startTranscription();
  }

  function stopTranscription() {
    callObject.stopTranscription();
  }

  return (
    <Aside onClose={() => setShowAside(false)}>
        {isOwner && (
          <div className="owner-actions">
            <Button
              fullWidth
              size="tiny"
              onClick={() =>
                startTranscription()
              }
            >
              Start transcribing
            </Button>
            <Button
              fullWidth
              size="tiny"
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
