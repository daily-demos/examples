import React, { useEffect, useRef } from 'react';
import { useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare';


const WebAudioTracks = ({ tracks }) => {
  const audioEl = useRef(null);
  /**
   * Dummy audio to assign each track to once, to workaround Chrome bug.
   * MediaStream must be assigned at least once to a DOM element, otherwise Web Audio remains silent.
   * See https://bugs.chromium.org/p/chromium/issues/detail?id=933677
   */
  const dummyAudioEl = useRef(null);
  const audioCtx = useRef(null);
  const destination = useRef(null);
  const inputNodes = useRef({});

  useEffect(() => {
    if (!audioEl.current) return;
    const AC = AudioContext || webkitAudioContext;
    audioCtx.current = window.audioContext ?? new AC();
    // Workaround as long as MediaDevices.selectAudioOutput is not supported
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/selectAudioOutput
    destination.current = audioCtx.current.createMediaStreamDestination();
    audioEl.current.srcObject = destination.current.stream;
    // Expose map of connected nodes for Debugger
    window['dailyAudioNodes'] = inputNodes.current;
  }, []);

  const trackIds = useDeepCompareMemo(
    () => Object.values(tracks).map((t) => t?.persistentTrack?.id),
    [tracks]
  );

  useDeepCompareEffect(() => {
    const audio = audioEl.current;
    if (!audio) return;

    const disconnectTrack = (trackId) => {
      if (!trackId) return;
      const node = inputNodes.current?.[trackId];
      if (!node) return;
      node.disconnect();
      delete inputNodes.current[trackId];
    };

    const connectTrack = (track) => {
      // Check if track is already connected
      if (Object.keys(inputNodes.current).includes(track.id)) return;
      const mediaStream = new MediaStream([track]);
      const node = new MediaStreamAudioSourceNode(audioCtx.current, {
        mediaStream: mediaStream,
      });
      inputNodes.current[track.id] = node;
      try {
        node.connect(destination.current);
        dummyAudioEl.current.srcObject = mediaStream;
      } catch (e) {
        console.error(e);
      }
    };

    const allTracks = Object.values(tracks);
    for (const track of allTracks) {
      // @ts-ignore
      const persistentTrack = track?.persistentTrack;
      if (persistentTrack) {
        switch (persistentTrack.readyState) {
          case 'ended':
            disconnectTrack(persistentTrack?.id);
            break;
          case 'live':
            persistentTrack.addEventListener(
              'ended',
              () => {
                disconnectTrack(persistentTrack?.id);
              },
              { once: true }
            );
            connectTrack(persistentTrack);
            break;
        }
      }
    }
  }, [tracks, trackIds]);

  return (
    <>
      <audio autoPlay playsInline ref={audioEl} />
      <audio muted ref={dummyAudioEl} />
    </>
  );
};

export default WebAudioTracks;