import React from 'react';
import Modal from '@dailyjs/shared/components/Modal';

import PropTypes from 'prop-types';

export const WaitingRoomModal = ({ onClose }) => (
  <Modal title="Waiting room" isOpen onClose={() => onClose()} actions={[]}>
    Hello
  </Modal>
);

WaitingRoomModal.propTypes = {
  onClose: PropTypes.func,
};

export default WaitingRoomModal;
