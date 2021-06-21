import React from 'react';
import PropTypes from 'prop-types';

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
