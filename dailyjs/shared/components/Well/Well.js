import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export const Well = ({ children, variant }) => (
  <div className={classNames('well', variant)}>
    {children}
    <style jsx>{`
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      font-weight: var(--weight-medium);

      .error {
        background-color: var(--red-light);
        color: var(--red-default);
      }
    `}</style>
  </div>
);

Well.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['error', 'warning', 'info']),
};

export default Well;
