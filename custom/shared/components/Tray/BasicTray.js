import React, { useRef, useState, useEffect, useMemo } from 'react';
import { NETWORK_ASIDE } from '@custom/shared/components/Aside/NetworkAside';
import { PEOPLE_ASIDE } from '@custom/shared/components/Aside/PeopleAside';
import Button from '@custom/shared/components/Button';
import { DEVICE_MODAL } from '@custom/shared/components/DeviceSelectModal';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { useResponsive } from '@custom/shared/hooks/useResponsive';
import { ReactComponent as IconCameraOff } from '@custom/shared/icons/camera-off-md.svg';
import { ReactComponent as IconCameraOn } from '@custom/shared/icons/camera-on-md.svg';
import { ReactComponent as IconLeave } from '@custom/shared/icons/leave-md.svg';
import { ReactComponent as IconMicOff } from '@custom/shared/icons/mic-off-md.svg';
import { ReactComponent as IconMicOn } from '@custom/shared/icons/mic-on-md.svg';
import { ReactComponent as IconMore } from '@custom/shared/icons/more-md.svg';
import { ReactComponent as IconNetwork } from '@custom/shared/icons/network-md.svg';
import { ReactComponent as IconPeople } from '@custom/shared/icons/people-md.svg';
import { ReactComponent as IconSettings } from '@custom/shared/icons/settings-md.svg';
import { useDevices, useLocalParticipant } from '@daily-co/daily-react-hooks';
import { Tray, TrayButton } from './Tray';

export const BasicTray = () => {
  const ref = useRef(null);
  const responsive = useResponsive();
  const [showMore, setShowMore] = useState(false);
  const { callObject, leave } = useCallState();
  const { customTrayComponent, openModal, toggleAside } = useUIState();
  const { hasCamError, hasMicError } = useDevices();

  const localParticipant = useLocalParticipant();

  const isCamMuted = useMemo(
    () => !localParticipant?.video || hasCamError,
    [hasCamError, localParticipant?.video]
  );

  const isMicMuted = useMemo(
    () => !localParticipant?.audio || hasMicError,
    [hasMicError, localParticipant?.audio]
  );

  const toggleCamera = (newState) => {
    if (!callObject) return false;
    return callObject.setLocalVideo(newState);
  };

  const toggleMic = (newState) => {
    if (!callObject) return false;
    return callObject.setLocalAudio(newState);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target))
        setShowMore(false);
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  return (
    <Tray className="tray">
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
      {responsive.isMobile() && showMore && (
        <div className="more-options" ref={ref}>
          <Button
            className="translucent"
            onClick={() => openModal(DEVICE_MODAL)}
            IconBefore={IconSettings}
          >
            Settings
          </Button>
          <Button
            className="translucent"
            onClick={() => toggleAside(NETWORK_ASIDE)}
            IconBefore={IconNetwork}
          >
            Network
          </Button>
          <Button
            className="translucent"
            onClick={() => toggleAside(PEOPLE_ASIDE)}
            IconBefore={IconPeople}
          >
            People
          </Button>
        </div>
      )}
      {!responsive.isMobile() ? (
        <>
          <TrayButton label="Settings" onClick={() => openModal(DEVICE_MODAL)}>
            <IconSettings />
          </TrayButton>
          <TrayButton
            label="Network"
            onClick={() => toggleAside(NETWORK_ASIDE)}
          >
            <IconNetwork />
          </TrayButton>
          <TrayButton label="People" onClick={() => toggleAside(PEOPLE_ASIDE)}>
            <IconPeople />
          </TrayButton>
        </>
      ) : (
        <TrayButton label="More" onClick={() => setShowMore(!showMore)}>
          <IconMore />
        </TrayButton>
      )}

      {customTrayComponent}

      <span className="divider" />

      <TrayButton label="Leave" onClick={() => leave()} orange>
        <IconLeave />
      </TrayButton>
      <style jsx>
        {`
          .tray {
            position: relative;
          }
          .more-options {
            background: var(--background);
            position: absolute;
            transform: translateX(calc(-50% + 26px));
            bottom: calc(15% + var(--spacing-xxxs));
            z-index: 99;
            padding: var(--spacing-xxxs);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-depth-2);
          }
        `}
      </style>
    </Tray>
  );
};
export default BasicTray;
