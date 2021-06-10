import React from 'react';
import Modal from '@dailyjs/shared/components/Modal';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import { Button } from '../Button';
import { DeviceSelect } from '../DeviceSelect';

export const DeviceSelectModal = () => {
  const { showDeviceModal, setShowDeviceModal } = useUIState();

  return (
    <Modal
      title="Select your device"
      isOpen={showDeviceModal}
      onClose={() => setShowDeviceModal(false)}
      actions={[
        <Button fullWidth variant="outline">
          Cancel
        </Button>,
        <Button fullWidth>Update</Button>,
      ]}
    >
      <DeviceSelect />
    </Modal>
  );
};

export default DeviceSelectModal;
