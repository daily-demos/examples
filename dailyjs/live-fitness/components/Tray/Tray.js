import React from 'react';
import FlyingEmojiTrayButton from '@dailyjs/flying-emojis/components/Tray';
import LiveStreamingButton from '@dailyjs/live-streaming/components/Tray';
import RecordingButton from '@dailyjs/recording/components/Tray';
import { useParticipants } from '@dailyjs/shared/contexts/ParticipantsProvider';
import ChatTrayButton from '@dailyjs/text-chat/components/Tray';

export const Tray = () => {
  const { isOwner } = useParticipants();

  if (isOwner) {
    return (
      <>
        <FlyingEmojiTrayButton />
        <ChatTrayButton />
        <LiveStreamingButton />
        <RecordingButton />
      </>
    );
  }

  return (
    <>
      <FlyingEmojiTrayButton />
      <ChatTrayButton />
    </>
  );
};

export default Tray;
