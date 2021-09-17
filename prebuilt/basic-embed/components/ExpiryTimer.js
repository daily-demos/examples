import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export const ExpiryTimer = ({ expiry }) => {
  const [secs, setSecs] = useState('--:--');

  // If room has an expiry time, we'll calculate how many seconds until expiry
  useEffect(() => {
    if (!expiry) {
      return false;
    }
    const i = setInterval(() => {
      const timeLeft = Math.round(expiry - Date.now() / 1000);
      if (timeLeft < 0) {
        return setSecs(null);
      }
      setSecs(`${Math.floor(timeLeft / 60)}:${`0${timeLeft % 60}`.slice(-2)}`);
    }, 1000);

    return () => clearInterval(i);
  }, [expiry]);

  if (!secs) {
    return null;
  }

  return (
    <div className="countdown">
      {secs}
      <style jsx>{`
        .countdown {
          position: fixed;
          top: 0px;
          right: 0px;
          width: 48px;
          text-align: center;
          padding: 4px 0;
          font-size: 0.875rem;
          font-weight: var(--weight-medium);
          border-radius: 0 0 0 var(--radius-sm);
          background: var(--secondary-dark);
          color: white;
          z-index: 999;
        }
      `}</style>
    </div>
  );
};

ExpiryTimer.propTypes = {
  expiry: PropTypes.number,
};

export default ExpiryTimer;
