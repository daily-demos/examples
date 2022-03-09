import React, { useMemo } from 'react';
import { useDevices } from '@daily-co/daily-react-hooks';
import Field from '../Field';
import { SelectInput } from '../Input';

export const DeviceSelect = () => {
  const {
    camState,
    cameras,
    setCamera,
    micState,
    microphones,
    setMicrophone,
    speakers,
    setSpeaker,
  } = useDevices();

  const camOptions = useMemo(() => {
    switch (camState) {
      case 'blocked':
        return [
          {
            label: 'Camera access blocked',
            value: null,
          },
        ];
      case 'not-found':
        return [
          {
            label: 'Camera not found',
            value: null,
          },
        ];
      default:
        if (!cameras.length) {
          return [
            {
              label: 'Turn on camera to allow access',
              value: null,
            },
          ];
        }
        return cameras.map((cam) => ({
          label:
            cam.state === 'in-use'
              ? `⚠️ ${cam.device.label || cam.device.deviceId}`
              : cam.device.label || cam.device.deviceId,
          selected: cam.selected,
          value: cam.device.deviceId,
        }));
    }
  }, [camState, cameras]);

  const micOptions = useMemo(() => {
    switch (micState) {
      case 'blocked':
        return [
          {
            label: 'Microphone access blocked',
            value: null,
          },
        ];
      case 'not-found':
        return [
          {
            label: 'Microphone not found',
            value: null,
          },
        ];
      default:
        if (!microphones.length) {
          return [
            {
              label: 'Unmute microphone to allow access',
              value: null,
            },
          ];
        }
        return microphones.map((mic) => ({
          label:
            mic.state === 'in-use'
              ? `⚠️ ${mic.device.label || mic.device.deviceId}`
              : mic.device.label || mic.device.deviceId,
          selected: mic.selected,
          value: mic.device.deviceId,
        }));
    }
  }, [micState, microphones]);

  const speakerOptions = useMemo(() => {
    if (speakers.length > 0) {
      return speakers.map((speaker) => ({
        label: speaker.device.label || speaker.device.deviceId,
        selected: speaker.selected,
        value: speaker.device.deviceId,
      }));
    } else {
      return [
        {
          label: 'System default',
          selected: true,
          value: 'default',
        },
      ];
    }
  }, [speakers]);

  return (
    <>
      <Field label="Select camera:">
        <SelectInput
          disabled={!cameras.length}
          onChange={(e) => setCamera(e.target.value)}
        >
          {camOptions.map(({ label, selected, value }) => (
            <option key={`cam-${label}`} value={value} selected={selected}>
              {label}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field label="Select microphone:">
        <SelectInput
          disabled={!microphones.length}
          onChange={(e) => setMicrophone(e.target.value)}
        >
          {micOptions.map(({ label, selected, value }) => (
            <option key={`mic-${label}`} value={value} selected={selected}>
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
            disabled={!speakers.length}
            onChange={(e) => setSpeaker(e.target.value)}
          >
            {speakerOptions.map(({ label, selected, value }) => (
              <option
                key={`speakers-${label}`}
                value={value}
                selected={selected}
              >
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
