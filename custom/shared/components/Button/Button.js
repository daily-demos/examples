import React, { forwardRef } from 'react';
import classnames from 'classnames';
import Link from 'next/link';
import PropTypes from 'prop-types';
import theme from '../../styles/defaultTheme';
import { hexa } from '../../styles/global';

export const Button = forwardRef(
  (
    {
      children,
      className,
      disabled = false,
      fullWidth,
      href,
      IconAfter = null,
      IconBefore = null,
      loading = false,
      size = 'medium',
      type = 'button',
      variant = 'primary',
      shadow = false,
      ...rest
    },
    ref
  ) => {
    const cx = classnames('button', className, size, variant, {
      disabled,
      fullWidth,
      loading,
      shadow,
    });

    const content = (
      <>
        {IconBefore && <IconBefore style={{ marginRight: '.5em'}}/>}
        {children}
        {IconAfter && <IconAfter style={{ marginLeft: '.5em'}}/>}
      </>
    );

    return (
      <>
        {href ? (
          <Link href={href}>
            <a className={cx} ref={ref} {...rest}>
              {content}
            </a>
          </Link>
        ) : (
          <button
            ref={ref}
            className={cx}
            // eslint-disable-next-line react/button-has-type
            type={type || 'button'}
            disabled={disabled}
            {...rest}
          >
            {content}
          </button>
        )}
        <style jsx>{`
          .button {
            font-family: var(--font-family);
            font-weight: var(--weight-medium);
            font-size: 1rem;
            text-align: center;
            text-decoration: none;
            white-space: nowrap;
            display: flex;
            align-items: center;
            text-align: center;
            justify-content: center;
            cursor: pointer;
            outline: none;
            flex-shrink: 0;
            user-select: none;
            position: relative;
            border: 1px solid transparent;
            border-radius: var(--radius-sm);
            margin: 0;
            height: 48px;
            padding: 0 var(--spacing-sm);
            box-shadow: 0 0 0 0 transparent;
            color: var(--text-darkest);
            background-color: var(--primary-default);
            transition: all 200ms ease;
          }

          .button.fullWidth {
            flex: 1;
          }

          .button:visited {
            color: var(--text-darkest);
          }

          .button:hover,
          .button:focus,
          .button:active,
          .button[href]:hover,
          .button[href]:focus,
          .button[href]:active {
            outline: none;
            text-decoration: none;
            border: 1px solid var(--primary-dark);
          }

          .button:focus {
            box-shadow: 0 0 0px 3px ${hexa(theme.primary.default, 0.35)};
          }

          .button::-moz-focus-inner {
            border: 0;
          }

          .button:disabled {
            border-color: var(--gray-default);
            background-color: var(--gray-default);
            color: var(--gray-dark);
            cursor: not-allowed;
          }

          .button.warning {
            background: var(--secondary-default);
            border-color: var(--secondary-default);
          }
          .button.warning:focus {
            box-shadow: 0 0 0px 3px ${hexa(theme.secondary.default, 0.35)};
          }
          .button.warning:hover {
            border-color: var(--secondary-dark);
          }

          .button.error {
            background: var(--red-default);
            border-color: var(--red-default);
          }
          .button.error:focus {
            box-shadow: 0 0 0px 3px ${hexa(theme.red.default, 0.35)};
          }
          .button.error:hover {
            border-color: var(--red-dark);
          }

          .button.error-light {
            background: var(--red-light);
            border-color: var(--red-light);
            color: var(--red-default);
          }
          .button.error-light:focus {
            box-shadow: 0 0 0px 3px ${hexa(theme.red.default, 0.35)};
          }
          .button.error-light:hover {
            color: white;
            background: var(--red-default);
            border-color: var(--red-default);
          }

          .button.success {
            background: var(--green-default);
            border-color: var(--green-default);
          }
          .button.success:focus {
            box-shadow: 0 0 0px 3px ${hexa(theme.green.default, 0.35)};
          }
          .button.success:hover {
            border-color: var(--green-dark);
          }

          .button.success-light {
            background: var(--green-light);
            border-color: var(--green-light);
            color: var(--green-default);
          }
          .button.success-light:focus {
            box-shadow: 0 0 0px 3px ${hexa(theme.green.default, 0.35)};
          }
          .button.success-light:hover {
            color: white;
            background: var(--green-default);
            border-color: var(--green-default);
          }

          .button.shadow {
            box-shadow: 0 0 4px 0 rgb(0 0 0 / 8%), 0 4px 4px 0 rgb(0 0 0 / 4%);
          }

          .button.shadow:hover {
            box-shadow: 0 0 4px 0 rgb(0 0 0 / 8%), 0 4px 4px 0 rgb(0 0 0 / 12%);
          }

          .button.small {
            height: 42px;
          }

          .button.tiny {
            height: 28px;
            font-size: 11px;
            border-radius: var(--radius-xs);
            text-transform: uppercase;
          }

          .button.tiny-square {
            padding: 0px;
            height: 32px;
            width: 32px;
          }
          .button.small-square {
            padding: 0px;
            height: 42px;
            width: 42px;
          }
          .button.medium-square {
            padding: 0px;
            height: 48px;
            width: 48px;
          }
          .button.large-square {
            padding: 0px;
            height: 52px;
            width: 52px;
          }

          .button.large-circle {
            padding: 0px;
            height: 64px;
            width: 64px;
            border-radius: 32px;
          }
          
          .button.small-circle {
            padding: 0px;
            height: 42px;
            width: 42px;
            border-radius: 21px;
          }

          .button.translucent {
            background: ${hexa(theme.blue.light, 0.35)};
            color: white;
            border: 0px;
          }
          .button.translucent:hover,
          .button.translucent:focus,
          .button.translucent:active {
            border: 0px;
            box-shadow: none;
            background: ${hexa(theme.blue.light, 1)};
          }

          .button.transparent {
            background: transparent;
            color: var(--primary-default);
            border: 0px;
          }
          .button.transparent:hover,
          .button.transparent:focus,
          .button.transparent:active {
            border: 0px;
            box-shadow: none;
            color: var(--primary-dark);
          }

          .button.blur {
            background: ${hexa(theme.blue.default, 0.35)};
            backdrop-filter: blur(10px);
            color: white;
            border: 0px;
          }
          .button.blur:hover,
          .button.blur:focus,
          .button.blur:active {
            border: 0px;
            box-shadow: none;
            background: ${hexa(theme.blue.default, 1)};
          }
          .button.blur:focus {
            box-shadow: 0 0 0px 3px ${hexa(theme.blue.default, 0.35)};
          }

          .button.dark {
            background: ${theme.blue.dark};
            color: white;
            border: 0px;
          }
          .button.dark:hover,
          .button.dark:focus,
          .button.dark:active {
            background: ${theme.blue.default};
            border: 0px;
          }
          .button.dark:focus {
            box-shadow: 0 0 0px 3px rgba(255, 255, 255, 0.15);
          }
          .button.dark:disabled {
            opacity: 0.35;
          }
          
          .button.gray {
            background: ${theme.gray.light};
            color: var(--text-default);
            border: 0;
          }
          .button.gray:hover,
          .button.gray:focus,
          .button.gray:active {
            background: ${theme.gray.default};
            border: 0;
          }
          .button.gray:focus {
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15);
          }
          .button.gray:disabled {
            opacity: 0.35;
          }

          .button.white {
            background: white;
            border: 0px;
          }
          .button.white:hover,
          .button.white:focus,
          .button.white:active {
            background: var(--gray-wash);
            border: 0px;
            color: var(--primary-default);
          }
          .button.white:focus {
            box-shadow: 0 0 0px 3px rgba(0, 0, 0, 0.15);
          }
          .button.white:disabled {
            opacity: 0.35;
          }

          .button.outline {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: white;
          }
          .button.outline:hover,
          .button.outline:focus,
          .button.outline:active {
            border: 1px solid rgba(255, 255, 255, 0.25);
            box-shadow: none;
          }
          .button.outline:focus {
            box-shadow: 0 0 0px 3px rgba(255, 255, 255, 0.15);
          }

          .button.outline-gray {
            background: transparent;
            border: 1px solid var(--gray-light);
            color: var(--text-light);
          }
          .button.outline-gray:hover,
          .button.outline-gray:focus,
          .button.outline-gray:active {
            border: 1px solid var(--gray-default);
            box-shadow: none;
          }
          .button.outline-gray:focus {
            box-shadow: 0 0 0px 3px rgba(0, 0, 0, 0.05);
          }

          .button.outline-dark {
            background: transparent;
            border: 1px solid var(--blue-light);
            color: var(--text-light);
          }

          .button.outline-dark:hover,
          .button.outline-dark:focus,
          .button.outline-dark:active {
            border: 1px solid var(--primary-default);
            box-shadow: none;
          }
          .button.outline-dark:focus {
            box-shadow: 0 0 0px 3px ${hexa(theme.primary.default, 0.35)};
          }

          .button.muted {
            color: var(--red-default);
          }
        `}</style>
      </>
    );
  }
);

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  href: PropTypes.string,
  IconAfter: PropTypes.node,
  IconBefore: PropTypes.node,
  loading: PropTypes.bool,
  size: PropTypes.string,
  type: PropTypes.oneOf(['button', 'reset', 'submit']),
  variant: PropTypes.string,
  shadow: PropTypes.bool,
};

export default Button;
