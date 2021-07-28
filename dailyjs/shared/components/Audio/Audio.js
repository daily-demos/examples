/**
 * Audio
 */
import React, { useEffect, useMemo } from 'react';
import { useTracks } from '@dailyjs/shared/contexts/TracksProvider';
import Bowser from 'bowser';
import { Portal } from 'react-portal';
import AudioTrack from './AudioTrack';
import CombinedAudioTrack from './CombinedAudioTrack';

export const Audio = () => {
  const { audioTracks } = useTracks();

  const renderedTracks = useMemo(
    () =>
      Object.entries(audioTracks).reduce(
        (tracks, [id, track]) => ({ ...tracks, [id]: track }),
        {}
      ),
    [audioTracks]
  );

  // On iOS safari, when headphones are disconnected, all audio elements are paused.
  // This means that when a user disconnects their headphones, that user will not
  // be able to hear any other users until they mute/unmute their mics.
  // To fix that, we call `play` on each audio track on all devicechange events.
  useEffect(() => {
    const playTracks = () => {
      document.querySelectorAll('.audioTracks audio').forEach(async (audio) => {
        try {
          if (audio.paused && audio.readyState === audio.HAVE_ENOUGH_DATA) {
            await audio?.play();
          }
        } catch (e) {
          // Auto play failed
        }
      });
    };
    navigator.mediaDevices.addEventListener('devicechange', playTracks);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', playTracks);
    };
  }, []);

  const tracksComponent = useMemo(() => {
    const { browser } = Bowser.parse(navigator.userAgent);
    if (browser.name === 'Chrome' && parseInt(browser.version, 10) >= 92) {
      return <CombinedAudioTrack tracks={renderedTracks} />;
    }
    return Object.entries(renderedTracks).map(([id, track]) => (
      <AudioTrack key={id} track={track.persistentTrack} />
    ));
  }, [renderedTracks]);

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

export default Audio;
