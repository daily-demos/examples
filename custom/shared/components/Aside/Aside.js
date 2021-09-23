import React from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as IconClose } from '../../icons/close-sm.svg';
import Button from '../Button';

export const ASIDE_WIDTH = 380;

export const Aside = ({ onClose, children }) => (
  <aside className="call-aside">
    <div className="inner">{children}</div>
    <div className="close">
      <Button
        size="small-square"
        variant="white"
        className="closeButton"
        onClick={onClose}
      >
        <IconClose />
      </Button>
    </div>
    <style jsx>{`
      .call-aside {
        background: white;
        position: relative;
        flex-shrink: 0;
        flex-grow: 0;
        width: ${ASIDE_WIDTH}px;
        height: 100vh;
        box-sizing: border-box;
        box-shadow: 0px 15px 35px rgba(18, 26, 36, 0.25);
        color: var(--text-default);
      }

      .call-aside .inner {
        overflow-x: hidden;
        overflow-y: scroll;
        height: 100%;
        display: flex;
        flex-flow: column wrap;
      }

      .call-aside .close {
        position: absolute;
        top: var(--spacing-xxs);
        left: calc(-43px);
        border-right: 1px solid var(--gray-wash);
        z-index: 99;
      }

      .call-aside :global(.closeButton) {
        border-radius: var(--radius-sm) 0 0 var(--radius-sm);
        height: 48px;
      }
    `}</style>
  </aside>
);

Aside.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func,
};

export default Aside;
