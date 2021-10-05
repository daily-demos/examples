import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export const Capsule = ({ children, variant }) => (
  <span className={classNames('capsule', variant)}>
    {children}
    <style jsx>{`
      display: inline-flex;
      padding: 4px 6px;
      margin: 0 6px;
      align-items: center;
      line-height: 1;
      justify-content: center;
      border-radius: 5px;
      font-size: 0.75rem;
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      letter-spacing: 1px;

      .capsule.success {
        background-color: var(--green-default);
        color: #ffffff;
      }
      .capsule.warning {
        background-color: var(--secondary-default);
        color: #ffffff;
      }
      .capsule.error {
        background-color: var(--red-default);
        color: #ffffff;
      }
    `}</style>
  </span>
);

Capsule.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']),
};

export default Capsule;
