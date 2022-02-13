/**
 * Audio
 * ---
 * When working with audio elements it's very important to avoid mutating
 * the DOM elements as much as possible to avoid audio pops and crackles.
 * This component addresses to known browser quirks; Safari autoplay
 * and Chrome's maximum media elements. On Chrome we add all audio tracks
 * into into a single audio node using the CombinedAudioTrack component
 */
import React, { useEffect, useMemo } from 'react';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useTracks } from '@custom/shared/contexts/TracksProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { isScreenId } from '@custom/shared/contexts/participantsState';
import Bowser from 'bowser';
import { Portal } from 'react-portal';
import AudioTrack from './AudioTrack';
import CombinedAudioTrack from './CombinedAudioTrack';


export const Audio = () => {
  const { disableAudio } = useCallState();
  const { audioTracks } = useTracks();
  const { setShowAutoplayFailedModal } = useUIState();

  const renderedTracks = useMemo(
    () =>
      Object.entries(audioTracks).reduce((tracks, [id, track]) => {
        if (!disableAudio || isScreenId(id)) {
          tracks[id] = track;
        }
        return tracks;
      }, {}),
    [audioTracks, disableAudio]
  );

  // On iOS safari, when headphones are disconnected, all audio elements are paused.
  // This means that when a user disconnects their headphones, that user will not
  // be able to hear any other users until they mute/unmute their mics.
  // To fix that, we call `play` on each audio track on all devicechange events.
  useEffect(() => {
    const playTracks = () => {
      document
        .querySelectorAll('.audioTracks audio')
        .forEach(async (audio) => {
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
    const { browser, platform, os } = Bowser.parse(navigator.userAgent);
    if (
      browser.name === 'Chrome' &&
      parseInt(browser.version, 10) >= 92 &&
      (platform.type === 'desktop' || os.name === 'Android')
    ) {
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
