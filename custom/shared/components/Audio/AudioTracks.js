import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNetwork, useParticipantIds } from '@daily-co/daily-react-hooks';
import { Portal } from 'react-portal';

import { useCallState } from '../../contexts/CallProvider';
import { useUIState } from '../../contexts/UIStateProvider';
import { isSafari } from '../../lib/browserConfig';
import { AudioTrack } from './AudioTrack';
import { WebAudioTracks } from './WebAudioTracks';

export const AudioTracks = () => {
  const { disableAudio } = useCallState();
  const { topology } = useNetwork();
  const { setShowAutoplayFailedModal } = useUIState();
  const [isClient, setIsClient] = useState(false);

  const subscribedIds = useParticipantIds({
    filter: useCallback(
      (p) =>
        !p.local &&
        (p.tracks.audio.subscribed === true ||
          p.tracks.screenAudio.subscribed === true),
      []
    ),
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const playTracks = () => {
      document.querySelectorAll('.audioTracks audio').forEach(async (audio) => {
        try {
          if (audio.paused && audio.readyState === audio.HAVE_ENOUGH_DATA) {
            await audio?.play();
          }
        } catch (e) {
          setShowAutoplayFailedModal(true);
        }
      });
    };

    navigator.mediaDevices.addEventListener('devicechange', playTracks);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', playTracks);
    };
  }, [setShowAutoplayFailedModal]);

  const tracksComponent = useMemo(() => {
    if (disableAudio) return null;
    if (isSafari() || topology === 'peer') {
      return subscribedIds.map((sessionId) => (
        // @ts-ignore
        <AudioTrack key={sessionId} sessionId={sessionId} />
      ));
    }
    return <WebAudioTracks />;
  }, [disableAudio, subscribedIds, topology]);

  // Only render audio tracks in browser
  if (!isClient) return null;

  return (
    <Portal key="AudioTracks">
      <div className="audioTracks">
        {tracksComponent}
        <style jsx>{`
          .audioTracks {
            position: absolute;
            visibility: hidden;
          }
        `}</style>
      </div>
    </Portal>
  );
};
