import React from 'react';
import Modal from '@dailyjs/shared/components/Modal';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';
import Button from '../Button';
import DeviceSelect from '../DeviceSelect';

export const DEVICE_MODAL = 'device';

export const DeviceSelectModal = () => {
  const { currentModals, closeModal } = useUIState();

  return (
    <Modal
      title="Select your device"
      isOpen={currentModals[DEVICE_MODAL]}
      onClose={() => closeModal(DEVICE_MODAL)}
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
