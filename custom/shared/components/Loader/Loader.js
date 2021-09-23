import React from 'react';
import PropTypes from 'prop-types';

export const Loader = ({
  color = 'currentColor',
  size = 24,
  centered = false,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 44 44"
    className={centered ? 'loader centered' : 'loader'}
  >
    <g fill="none" fillRule="evenodd" strokeWidth="2">
      <circle cx="22" cy="22" r="19.4775">
        <animate
          attributeName="r"
          begin="0s"
          dur="1.8s"
          values="1; 20"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.165, 0.84, 0.44, 1"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-opacity"
          begin="0s"
          dur="1.8s"
          values="1; 0"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.3, 0.61, 0.355, 1"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="22" cy="22" r="11.8787">
        <animate
          attributeName="r"
          begin="-0.9s"
          dur="1.8s"
          values="1; 20"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.165, 0.84, 0.44, 1"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-opacity"
          begin="-0.9s"
          dur="1.8s"
          values="1; 0"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.3, 0.61, 0.355, 1"
          repeatCount="indefinite"
        />
      </circle>
    </g>
    <style jsx>{`
      svg {
        display: block;
        height: ${size}px;
        stroke: ${color};
        width: ${size}px;
      }
      .centered {
        position: absolute;
        top: 50%;
        margin-top: ${size / 2}px;
        left: 50%;
        margin-left: ${size / 2}px;
      }
    `}</style>
  </svg>
);

Loader.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  centered: PropTypes.bool,
};

export default Loader;
