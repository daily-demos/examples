import React from 'react';
import { useCallState } from '@dailyjs/shared/contexts/CallProvider';
import { useMediaDevices } from '@dailyjs/shared/contexts/MediaDeviceProvider';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import { ReactComponent as IconAdd } from '@dailyjs/shared/icons/add-md.svg';
import { ReactComponent as IconCameraOff } from '@dailyjs/shared/icons/camera-off-md.svg';
import { ReactComponent as IconCameraOn } from '@dailyjs/shared/icons/camera-on-md.svg';
import { ReactComponent as IconLeave } from '@dailyjs/shared/icons/leave-md.svg';
import { ReactComponent as IconMicOff } from '@dailyjs/shared/icons/mic-off-md.svg';
import { ReactComponent as IconMicOn } from '@dailyjs/shared/icons/mic-on-md.svg';
import { ReactComponent as IconSettings } from '@dailyjs/shared/icons/settings-md.svg';
import PropTypes from 'prop-types';

import { Audio } from '../Audio';
import { VideoGrid } from '../VideoGrid';
import { Header } from './Header';
import { Tray, TrayButton } from './Tray';

export const Room = ({ onLeave }) => {
  const { callObject, addFakeParticipant } = useCallState();
  const { setShowDeviceModal } = useUIState();
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
    <div className="room">
      <Header />

      <main>
        <VideoGrid />
      </main>

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
        <TrayButton label="Settings" onClick={() => setShowDeviceModal(true)}>
          <IconSettings />
        </TrayButton>
        <TrayButton label="Add fake" onClick={() => addFakeParticipant()}>
          <IconAdd />
        </TrayButton>
        <span className="divider" />
        <TrayButton label="Leave" onClick={onLeave} orange>
          <IconLeave />
        </TrayButton>
      </Tray>

      <Audio />

      <style jsx>{`
        .room {
          flex-flow: column nowrap;
          width: 100%;
          height: 100%;
          display: flex;
        }

        main {
          flex: 1 1 auto;
          position: relative;
          overflow: hidden;
          min-height: 0px;
          height: 100%;
          padding: var(--spacing-xxxs);
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

Room.propTypes = {
  onLeave: PropTypes.func.isRequired,
};

export default Room;
