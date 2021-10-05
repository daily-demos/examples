import React from 'react';
import PropTypes from 'prop-types';

export const Field = ({ label, children }) => (
  <div className="field">
    {label && <div className="label">{label}</div>}
    <div className="field">{children}</div>

    <style jsx>{`
      .field {
        margin-bottom: var(--spacing-sm);
      }

      .field .label {
        font-weight: var(--weight-medium);
        color: var(--text-default);
        margin-bottom: var(--spacing-xxxs);
      }
    `}</style>
  </div>
);

Field.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node,
};

export default Field;
