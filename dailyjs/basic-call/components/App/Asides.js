import React from 'react';
import PropTypes from 'prop-types';

export const Asides = ({ asides }) => (
  <>
    {asides.map((A) => (
      <A key={A.name} />
    ))}
  </>
);

Asides.propTypes = {
  asides: PropTypes.arrayOf(PropTypes.func),
};

export default Asides;
