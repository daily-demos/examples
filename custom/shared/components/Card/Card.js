import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export const Card = ({ children, className, variant }) => (
  <div className={classNames('card', className, variant)}>
    {children}
    <style jsx>{`
      .card {
        background: var(--reverse);
        box-sizing: border-box;
        border-radius: var(--radius-md);
        border: 1px solid #c8d1dc;
        padding: var(--spacing-md);
      }

      .card.dark {
        background-color: var(--blue-dark);
      }
    `}</style>
  </div>
);

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export const CardHeader = ({ children }) => (
  <header className="card-header">
    <h2>{children}</h2>
    <style jsx>{`
      h2 {
        font-size: 1.375rem;
        margin: 0px;
      }

      & + :global(.card-body) {
        margin-top: var(--spacing-lg);
      }
    `}</style>
  </header>
);
CardHeader.propTypes = {
  children: PropTypes.node,
};

export const CardBody = ({ children }) => (
  <div className="card-body">
    {children}
    <style jsx>{`
      .card-body {
        color: var(--text-mid);
      }

      & + :global(.card-footer) {
        margin-top: var(--spacing-md);
      }
    `}</style>
  </div>
);
CardBody.propTypes = {
  children: PropTypes.node,
};

export const CardFooter = ({ children, divider = false, flex = false }) => (
  <footer className={classNames('card-footer', { divider, flex })}>
    {children}
    <style jsx>{`
      .card-footer {
        display: flex;
      }

      :global(.card-footer.flex > *) {
        flex: 1;
      }

      .card-footer.divider {
        border-top: 1px solid var(--gray-light);
        padding-top: var(--spacing-md);
      }
    `}</style>
  </footer>
);
CardFooter.propTypes = {
  children: PropTypes.node,
  divider: PropTypes.bool,
  flex: PropTypes.bool,
};

export default Card;
