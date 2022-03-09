import React, { memo, useEffect, useRef } from 'react';
import { useCallback } from 'react';

import { useCallState } from '../../contexts/CallProvider';
import { Loopback } from '../../lib/loopback';

const WAT = () => {
  const { callObject } = useCallState();
  const audioEl = useRef(null);
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
    // Expose map of connected nodes for Debugger
    window['dailyAudioNodes'] = inputNodes.current;

    let loopback;
    async function setupLoopback() {
      loopback = new Loopback();
      await loopback.start(destination.current.stream);
      const loopbackStream = loopback.getLoopback();
      audioEl.current.srcObject = loopbackStream;
      audioEl.current.play();
    }

    setupLoopback();

    return () => loopback.destroy();
  }, []);

  const handleTrackStarted = useCallback(async ({ participant, track }) => {
    if (track.kind !== 'audio' || participant?.local) return;
    if (Object.keys(inputNodes.current).includes(track.id)) return;
    const mediaStream = new MediaStream([track]);
    const node = new MediaStreamAudioSourceNode(audioCtx.current, {
      mediaStream,
    });

    // Apparently this is required due to a Chromium bug!
    // https://bugs.chromium.org/p/chromium/issues/detail?id=933677
    // https://stackoverflow.com/questions/55703316/audio-from-rtcpeerconnection-is-not-audible-after-processing-in-audiocontext
    const mutedAudio = new Audio();
    mutedAudio.muted = true;
    mutedAudio.srcObject = mediaStream;
    mutedAudio.play();

    inputNodes.current[track.id] = node;
    node.connect(destination.current);
  }, []);

  const handleTrackStopped = useCallback(({ participant, track }) => {
    if (track.kind !== 'audio' || participant?.local) return;
    const node = inputNodes.current?.[track.id];
    if (!node) return;
    node.disconnect();
    delete inputNodes.current[track.id];
  }, []);

  useEffect(() => {
    if (!callObject) return;

    callObject.on('track-started', handleTrackStarted);
    callObject.on('track-stopped', handleTrackStopped);

    return () => {
      callObject.off('track-started', handleTrackStarted);
      callObject.off('track-stopped', handleTrackStopped);
    };
  }, [callObject, handleTrackStarted, handleTrackStopped]);

  return <audio autoPlay playsInline ref={audioEl} />;
};

export const WebAudioTracks = memo(WAT);
