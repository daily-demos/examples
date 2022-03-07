import React from 'react';
import { useMediaDevices } from '@custom/shared/contexts/MediaDeviceProvider';
import Field from '../Field';
import { SelectInput } from '../Input';

export const DeviceSelect = () => {
  const {
    cams,
    mics,
    speakers,
    currentCam,
    setCurrentCam,
    currentMic,
    setCurrentMic,
    currentSpeaker,
    setCurrentSpeaker,
  } = useMediaDevices();

  if (!currentCam && !currentMic && !currentSpeaker) {
    return <div>Loading devices...</div>;
  }

  return (
    <>
      <Field label="Select camera:">
        <SelectInput
          onChange={(e) => setCurrentCam(cams[e.target.value])}
          value={cams.findIndex(
            (i) => i.deviceId === currentCam.deviceId
          )}
        >
          {cams.map(({ deviceId, label }, i) => (
            <option key={`cam-${deviceId}`} value={i}>
              {label}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field label="Select microphone:">
        <SelectInput
          onChange={(e) => setCurrentMic(mics[e.target.value])}
          value={mics.findIndex(
            (i) => i.deviceId === currentMic.deviceId
          )}
        >
          {mics.map(({ deviceId, label }, i) => (
            <option key={`mic-${deviceId}`} value={i}>
              {label}
            </option>
          ))}
        </SelectInput>
      </Field>

      {/**
       * Note: Safari does not support selection audio output devices
       */}
      {speakers.length > 0 && (
        <Field label="Select speakers:">
          <SelectInput
            onChange={(e) => setCurrentSpeaker(speakers[e.target.value])}
            value={speakers.findIndex(
              (i) => i.deviceId === currentSpeaker.deviceId
            )}
          >
            {speakers.map(({ deviceId, label }, i) => (
              <option key={`speakers-${deviceId}`} value={i}>
                {label}
              </option>
            ))}
          </SelectInput>
        </Field>
      )}
    </>
  );
};

export default DeviceSelect;
