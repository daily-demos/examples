/**
 * Audio
 * ---
 * When working with audio elements it's very important to avoid mutating
 * the DOM elements as much as possible to avoid audio pops and crackles.
 * This component addresses to known browser quirks; Safari autoplay
 * and Chrome's maximum media elements. On Chrome we add all audio tracks
 * into into a single audio node using the CombinedAudioTrack component
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useTracks } from '@custom/shared/contexts/TracksProvider';
import { isSafari } from '@custom/shared/lib/browserConfig';
import { Portal } from 'react-portal';
import { useDeepCompareEffect } from 'use-deep-compare';
import { useCallState } from '../../contexts/CallProvider';
import { isScreenId } from '../../contexts/participantsState';
import { useNetworkState } from '../../hooks/useNetworkState';
import AudioTrack from './AudioTrack';
import { WebAudioTracks } from './WebAudioTracks';

export const Audio = () => {
  const { disableAudio } = useCallState();
  const { audioTracks } = useTracks();
  const [renderedTracks, setRenderedTracks] = useState({});
  const [isClient, setIsClient] = useState(false);
  const { topology } = useNetworkState();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useDeepCompareEffect(() => {
    const newTracks = Object.entries(audioTracks).reduce(
      (tracks, [id, track]) => {
        if (!disableAudio || isScreenId(id)) {
          tracks[id] = track;
        }
        return tracks;
      },
      {}
    );
    setRenderedTracks(newTracks);
  }, [audioTracks, disableAudio]);

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
    if (isSafari() || topology === 'peer') {
      return Object.entries(renderedTracks).map(([id, track]) => (
        <AudioTrack key={id} track={track.persistentTrack} />
      ));
    }
    return <WebAudioTracks />;
  }, [renderedTracks, topology]);

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

export default Audio;
