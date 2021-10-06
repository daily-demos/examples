import React from 'react';

import classNames from 'classnames';
import PropTypes from 'prop-types';

export const HeaderCapsule = ({ children, variant }) => {
  const cx = classNames('capsule', variant);

  return (
    <div className={cx}>
      {children}
      <style jsx>{`
        .capsule {
          display: flex;
          align-items: center;
          gap: var(--spacing-xxs);
          background-color: var(--blue-dark);
          border-radius: var(--radius-sm);
          padding: var(--spacing-xxxxs) var(--spacing-xxs);
          min-height: 40px;
          box-sizing: border-box;
          line-height: 1;
          font-weight: var(--weight-medium);
          user-select: none;
        }

        .capsule.button {
          padding-right: var(--spacing-xxxxs);
        }

        .capsule.recording {
          background: var(--secondary-default);
        }

        .capsule.recording span {
          display: block;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 12px;
          animation: capsulePulse 2s infinite linear;
        }

        @keyframes capsulePulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.25;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

HeaderCapsule.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.string,
};

export default HeaderCapsule;
