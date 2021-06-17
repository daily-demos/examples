import React from 'react';
import PropTypes from 'prop-types';

export const ASIDE_WIDTH = 380;

export const Aside = ({ children }) => (
  <aside className="call-aside">
    <div className="inner">{children}</div>
    <style jsx>{`
      .call-aside {
        background: white;
        width: ${ASIDE_WIDTH}px;
        height: 100vh;
        box-sizing: border-box;
        box-shadow: 0px 15px 35px rgba(18, 26, 36, 0.25);
        color: var(--text-default);
        overflow: hidden;
      }

      .call-aside .inner {
        overflow-y: scroll;
      }
    `}</style>
  </aside>
);

Aside.propTypes = {
  children: PropTypes.node,
};

export default Aside;
