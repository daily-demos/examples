import React from 'react';
import { PEOPLE_ASIDE } from '@dailyjs/shared/components/Aside/PeopleAside';
import { DEVICE_MODAL } from '@dailyjs/shared/components/DeviceSelectModal';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import { useMediaDevices } from '@dailyjs/shared/contexts/MediaDeviceProvider';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import { ReactComponent as IconCameraOff } from '@dailyjs/shared/icons/camera-off-md.svg';
import { ReactComponent as IconCameraOn } from '@dailyjs/shared/icons/camera-on-md.svg';
import { ReactComponent as IconLeave } from '@dailyjs/shared/icons/leave-md.svg';
import { ReactComponent as IconMicOff } from '@dailyjs/shared/icons/mic-off-md.svg';
import { ReactComponent as IconMicOn } from '@dailyjs/shared/icons/mic-on-md.svg';
import { ReactComponent as IconPeople } from '@dailyjs/shared/icons/people-md.svg';
import { ReactComponent as IconSettings } from '@dailyjs/shared/icons/settings-md.svg';
import { Tray, TrayButton } from './Tray';

export const BasicTray = () => {
  const { callObject, leave } = useCallState();
  const { customTrayComponent, openModal, toggleAside } = useUIState();
  const { isCamMuted, isMicMuted } = useMediaDevices();

  const toggleCamera = (newState) => {
    if (!callObject) return false;
    return callObject.setLocalVideo(newState);
  };

  const toggleMic = (newState) => {
    if (!callObject) return false;
    return callObject.setLocalAudio(newState);
  };

  return (
    <Tray>
      <TrayButton
        label="Camera"
        onClick={() => toggleCamera(isCamMuted)}
        orange={isCamMuted}
      >
        {isCamMuted ? <IconCameraOff /> : <IconCameraOn />}
      </TrayButton>
      <TrayButton
        label="Mic"
        onClick={() => toggleMic(isMicMuted)}
        orange={isMicMuted}
      >
        {isMicMuted ? <IconMicOff /> : <IconMicOn />}
      </TrayButton>
      <TrayButton label="Settings" onClick={() => openModal(DEVICE_MODAL)}>
        <IconSettings />
      </TrayButton>

      <TrayButton label="People" onClick={() => toggleAside(PEOPLE_ASIDE)}>
        <IconPeople />
      </TrayButton>

      <TrayButton label="Fake" onClick={() => callObject.addFakeParticipant()}>
        +
      </TrayButton>

      {customTrayComponent}

      <span className="divider" />

      <TrayButton label="Leave" onClick={() => leave()} orange>
        <IconLeave />
      </TrayButton>
    </Tray>
  );
};
export default BasicTray;
