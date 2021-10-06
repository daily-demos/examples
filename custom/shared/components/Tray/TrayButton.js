import React from 'react';
import Button from '@custom/shared/components/Button';
import PropTypes from 'prop-types';

export const TrayButton = ({ children, label, onClick, orange = false }) => (
  <div className={orange ? 'tray-button orange' : 'tray-button'}>
    <Button onClick={() => onClick()} variant="dark" size="large-square">
      {children}
    </Button>
    <span>{label}</span>

    <style jsx>{`
      .tray-button {
        text-align: center;
        user-select: none;
      }

      .tray-button.orange :global(.button) {
        color: var(--secondary-dark);
      }

      span {
        color: white;
        font-weight: var(--weight-medium);
        font-size: 12px;
      }
    `}</style>
  </div>
);

TrayButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  orange: PropTypes.bool,
  label: PropTypes.string.isRequired,
};

export default TrayButton;
