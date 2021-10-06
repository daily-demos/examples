import React from 'react';
import PropTypes from 'prop-types';

export const Header = ({ demoTitle, repoLink }) => (
  <header className="header">
    <div className="row">
      <img src="daily-logo.svg" alt="Daily" className="logo" />
      <div className="demoTitle">{demoTitle}</div>
    </div>
    <div className="row">
      <div className="capsule">
        <a
          href="https://docs.daily.co/docs/"
          target="_blank"
          rel="noopener noreferrer"
        >
          API docs
        </a>
      </div>
      <span className="divider" />
      <a href={repoLink} target="_blank" rel="noopener noreferrer">
        <img src="github-logo.png" alt="Ocotocat" className="logo octocat" />
      </a>
    </div>
    <style jsx>{`
      .header {
        display: flex;
        flex: 0 0 auto;
        padding: var(--spacing-sm);
        align-items: center;
        width: 100%;
        justify-content: space-between;
      }
      .row {
        display: flex;
        align-items: center;
      }
      .logo {
        margin-right: var(--spacing-xs);
      }
      .octocat {
        width: 24px;
        height: 24px;
        margin-left: var(--spacing-xxs);
      }
      .demoTitle,
      .capsule {
        color: var(--text-reverse);
        line-height: 1;
        font-weight: var(--weight-medium);
      }
      .capsule {
        display: flex;
        align-items: center;
        gap: var(--spacing-xxxs);
        background-color: var(--blue-dark);
        border-radius: var(--radius-sm);
        padding: var(--spacing-xxs) var(--spacing-xs);
        box-sizing: border-box;
        user-select: none;
        margin-right: var(--spacing-xxs);
      }
      .capsule a {
        text-decoration: none;
        color: var(--text-reverse);
      }
      .divider {
        background: var(--gray-light);
        margin: 0 var(--spacing-xxs);
        height: 32px;
        width: 1px;
      }
      @media only screen and (max-width: 750px) {
        .demoTitle {
          display: none;
        }
      }
    `}</style>
  </header>
);

Header.propTypes = {
  demoTitle: PropTypes.string,
  repoLink: PropTypes.string,
};

export default Header;
