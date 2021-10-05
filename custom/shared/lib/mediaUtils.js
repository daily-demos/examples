export const asyncGetUserDevices = async (useLocal = true) => {
  const devices = await callObject.getInputDevices(); // navigator.mediaDevices.enumerateDevices();

  const defaultCam = useLocal && localStorage.getItem('defaultCamId');
  const defaultMic = useLocal && localStorage.getItem('defaultMicId');
  const defaultSpeakers = useLocal && localStorage.getItem('defaultSpeakersId');

  const cams = devices.filter((d) => d.kind === 'videoinput');
  const mics = devices.filter((d) => d.kind === 'audioinput');
  const speakers = devices.filter((d) => d.kind === 'audiooutput');

  const defaultCamDevice = devices.filter((d) => d.deviceId === defaultCam);
  const defaultMicDevice = devices.filter((d) => d.deviceId === defaultMic);
  const defaultSpeakersDevice = devices.filter(
    (d) => d.deviceId === defaultSpeakers
  );

  const currentCam = defaultCamDevice.length ? defaultCamDevice[0] : cams[0];
  const currentMic = defaultMicDevice.length ? defaultMicDevice[0] : mics[0];
  const currentSpeakers = defaultSpeakersDevice.length
    ? defaultSpeakersDevice[0]
    : speakers[0];

  return { cams, mics, speakers, currentCam, currentMic, currentSpeakers };
};

export default asyncGetUserDevices;
