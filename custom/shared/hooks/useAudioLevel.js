import { useEffect, useState } from 'react';
import getConfig from 'next/config';

export const useAudioLevel = (stream) => {
  const [micVolume, setMicVolume] = useState(0);
  const { assetPrefix } = getConfig().publicRuntimeConfig;

  useEffect(() => {
    if (!stream) {
      setMicVolume(0);
      return;
    }
    const AudioCtx =
      typeof AudioContext !== 'undefined'
        ? AudioContext
        : typeof webkitAudioContext !== 'undefined'
          ? webkitAudioContext
          : null;
    if (!AudioCtx) return;
    const audioContext = new AudioCtx();
    const mediaStreamSource = audioContext.createMediaStreamSource(stream);
    let node;

    const startProcessing = async () => {
      try {
        await audioContext.audioWorklet.addModule(
          `${assetPrefix}/audiolevel-processor.js`
        );

        node = new AudioWorkletNode(audioContext, 'audiolevel');

        node.port.onmessage = (event) => {
          let volume = 0;
          if (event.data.volume) volume = event.data.volume;
          if (!node) return;
          setMicVolume(volume);
        };

        mediaStreamSource.connect(node).connect(audioContext.destination);
      } catch {}
    };

    startProcessing();

    return () => {
      node?.disconnect();
      node = null;
      mediaStreamSource?.disconnect();
      audioContext?.close();
    };
  }, [assetPrefix, stream]);

  return micVolume;
};