import { useCallback, useEffect, useMemo } from 'react';

import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { isSafari } from '@custom/shared/lib/browserConfig';
import { useNetwork, useParticipantIds } from '@daily-co/daily-react-hooks';
import { Portal } from 'react-portal';
import { AudioTrack } from './AudioTrack';
import { WebAudioTracks } from './WebAudioTracks';

export const AudioTracks = () => {
  const { disableAudio } = useCallState();
  const { topology } = useNetwork();
  const { setShowAutoplayFailedModal } = useUIState();

  const subscribedIds = useParticipantIds({
    filter: useCallback(
      p =>
        !p.local &&
        (p.tracks.audio.subscribed === true ||
          p.tracks.screenAudio.subscribed === true),
      [],
    ),
  });

  useEffect(() => {
    const playTracks = () => {
      document.querySelectorAll('.audioTracks audio').forEach(async audio => {
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
    // audio cuts out on using Chrome 93+ on macOS 12+ with calls > 2 people,
    // using Web audio in safari is causing audio output issues, so we are going
    // to have separate audio tags
    if (isSafari() || topology === 'peer') {
      return subscribedIds.map(sessionId => (
        <AudioTrack key={sessionId} sessionId={sessionId} />
      ));
    }
    return <WebAudioTracks />;
  }, [disableAudio, subscribedIds, topology]);

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
