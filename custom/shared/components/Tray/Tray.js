import React from 'react';
import Button from '@custom/shared/components/Button';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export const TrayButton = ({
  children,
  label,
  onClick,
  bubble = false,
  orange = false,
  disabled = false,
}) => {
  const cx = classNames('tray-button', { orange, bubble });
  return (
    <div className={cx}>
      <Button
        onClick={() => onClick()}
        variant="dark"
        size="large-square"
        disabled={disabled}
      >
        {children}
      </Button>
      <span>{label}</span>

      <style jsx>{`
        .tray-button {
          text-align: center;
          user-select: none;
          position: relative;
        }

        .tray-button.orange :global(.button) {
          color: var(--secondary-dark);
        }

        .tray-button.bubble::after {
          position: absolute;
          content: '';
          top: 10px;
          right: 10px;
          width: 9px;
          height: 9px;
          background: var(--green-default);
          border-radius: 50%;
          z-index: 99;
        }

        span {
          color: white;
          font-weight: var(--weight-medium);
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

TrayButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  orange: PropTypes.bool,
  bubble: PropTypes.bool,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

export const Tray = ({ children }) => (
  <footer>
    {children}
    <style jsx>{`
      footer {
        flex: 0 0 auto;
        padding: var(--spacing-xxs) var(--spacing-xs) var(--spacing-xs)
          var(--spacing-xs);
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
