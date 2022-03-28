import DailyIframe from '@daily-co/daily-js';
import { useRoom } from '@daily-co/daily-react-hooks';
import Bowser from 'bowser';

export function isCloudRecordingType(recType) {
  return recType === 'cloud' || recType === 'cloud-beta';
}

export const useCallConfig = () => {
  const room = useRoom();

  if (!room || Object.keys(room).length === 0) return {};

  const { config, domainConfig, tokenConfig } = room;

  const hasFullUIControls = tokenConfig?.is_owner;

  const recordingType =
    tokenConfig?.enable_recording ?? config?.enable_recording;

  const browser =
    typeof window === 'undefined'
      ? null
      : Bowser.parse(window.navigator.userAgent);
  const supportsLocalRecording =
    browser?.platform?.type === 'desktop' && browser?.engine?.name === 'Blink';

  return {
    roomInfo: room,
    enableChat: !!config?.enable_chat,
    enableNetworkUI:
      config?.enable_network_ui ?? !!domainConfig?.enable_network_ui,
    enablePeopleUI:
      config?.enable_people_ui ?? domainConfig?.enable_people_ui ?? true,
    enableRecording:
      hasFullUIControls &&
      ((recordingType === 'local' && supportsLocalRecording) ||
        isCloudRecordingType(recordingType))
        ? recordingType
        : null,
    enableScreenShare:
      hasFullUIControls &&
      (tokenConfig?.enable_screenshare ?? config?.enable_screenshare) &&
      DailyIframe.supportedBrowser().supportsScreenShare,
    enableVideoProcessingUI:
      DailyIframe.supportedBrowser().supportsVideoProcessing &&
      (config?.enable_video_processing_ui ??
        !!domainConfig?.enable_video_processing_ui),
    optimizeLargeCalls: config?.experimental_optimize_large_calls,
    poweredByDaily:
      domainConfig && 'hide_daily_branding' in domainConfig
        ? !domainConfig?.hide_daily_branding
        : false,
  };
};
