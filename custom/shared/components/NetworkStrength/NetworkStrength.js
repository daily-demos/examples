import React from 'react';
import { ReactComponent as IconSignal } from '@custom/shared/icons/signal-sm.svg';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export const NetworkStrength = ({ strength = 'good' }) => {
  const cx = classNames('network-strength', strength);

  return (
    <div className={cx}>
      <IconSignal />
      <style jsx>{`
        .network-strength {
          padding: var(--spacing-xxxxs);
          border-radius: 50%;
        }
        .good {
          background: var(--green-dark);
        }
        .low {
          background: var(--secondary-dark);
        }
        .very-low {
          background: var(--red-dark);
        }
      `}
      </style>
    </div>
  )
};

NetworkStrength.propTypes = {
  strength: PropTypes.oneOf(['very-low', 'low', 'good'])
};

export default NetworkStrength;