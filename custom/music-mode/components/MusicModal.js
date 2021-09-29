import React from 'react';
import Button from '@custom/shared/components/Button';
import { CardBody } from '@custom/shared/components/Card';
import Modal from '@custom/shared/components/Modal';
import Well from '@custom/shared/components/Well';

import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { useMusic } from '../contexts/MusicProvider';

export const MUSIC_MODAL = 'music';

export const MusicModal = () => {
  const { isModalOpen, closeModal } = useUIState();
  const { startMusic, error } = useMusic();

  return (
    <Modal
      title="Music"
      isOpen={isModalOpen(MUSIC_MODAL)}
      onClose={() => closeModal(MUSIC_MODAL)}
      actions={[
        <Button key="modal-close" fullWidth variant="outline">
          Close
        </Button>,
      ]}
    >
      <CardBody>
        {error && <Well variant="error">{error}</Well>}
        <p>
          Custom tracks allow you to send additional streams to Daily (when in
          SFU mode.) A custom tracks support a 'music' property that increases
          that bitrate for sending higher quality audio.
        </p>
        <p>
          For simplicity, this demo uses Chrome tab audio sharing. Click the
          button below, select "Chrome Tab", pick a tab that is playing music
          and make sure the "Share tab audio" checkbox is selected.
        </p>
        <hr />
        <Button onClick={() => startMusic()}>Share tab audio</Button>
      </CardBody>
    </Modal>
  );
};

export default MusicModal;
