import React from 'react';
import Button from '@dailyjs/shared/components/Button';
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

export const Tray = ({ children }) => (
  <footer>
    {children}
    <style jsx>{`
      footer {
        flex: 0 0 auto;
        padding: var(--spacing-xs);
        box-sizing: border-box;
        width: 100%;
        display: flex;
        justify-content: center;
        gap: var(--spacing-xxs);
      }

      footer :global(.divider) {
        width: 1px;
        height: 52px;
        background: rgba(255, 255, 255, 0.1);
      }
    `}</style>
  </footer>
);

Tray.propTypes = {
  children: PropTypes.node,
};

export default Tray;
