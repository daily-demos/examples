import React from 'react';
import PropTypes from 'prop-types';

export const VideoContainer = ({ children }) => (
  <main>
    {children}
    <style jsx>{`
      main {
        flex: 1 1 auto;
        position: relative;
        overflow: hidden;
        min-height: 0px;
        height: 100%;
        width: 100%;
        padding: var(--spacing-xxxs);
        box-sizing: border-box;
      }
    `}</style>
  </main>
);

VideoContainer.propTypes = {
  children: PropTypes.node,
};
export default VideoContainer;
