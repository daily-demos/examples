import React from 'react';
import { NETWORK_ASIDE } from '@custom/shared/components/Aside/NetworkAside';
import { PEOPLE_ASIDE } from '@custom/shared/components/Aside/PeopleAside';
import { DEVICE_MODAL } from '@custom/shared/components/DeviceSelectModal';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useMediaDevices } from '@custom/shared/contexts/MediaDeviceProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { ReactComponent as IconCameraOff } from '@custom/shared/icons/camera-off-md.svg';
import { ReactComponent as IconCameraOn } from '@custom/shared/icons/camera-on-md.svg';
import { ReactComponent as IconLeave } from '@custom/shared/icons/leave-md.svg';
import { ReactComponent as IconMicOff } from '@custom/shared/icons/mic-off-md.svg';
import { ReactComponent as IconMicOn } from '@custom/shared/icons/mic-on-md.svg';
import { ReactComponent as IconNetwork } from '@custom/shared/icons/network-md.svg';
import { ReactComponent as IconPeople } from '@custom/shared/icons/people-md.svg';
import { ReactComponent as IconSettings } from '@custom/shared/icons/settings-md.svg';
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
      <TrayButton label="Network" onClick={() => toggleAside(NETWORK_ASIDE)}>
        <IconNetwork />
      </TrayButton>
      <TrayButton label="People" onClick={() => toggleAside(PEOPLE_ASIDE)}>
        <IconPeople />
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
