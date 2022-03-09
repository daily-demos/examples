import React, { useState, forwardRef } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import theme from '../../styles/defaultTheme';
import { hexa } from '../../styles/global';

const InputContainer = ({ children, prefix, className }) => (
  <div className={className}>
    {prefix && <span>{prefix}</span>}
    {children}
    <style jsx>{`
      position: relative;
      display: flex;
      flex-flow: row;

      &.prefix > span {
        pointer-events: none;
        box-sizing: border-box;
        flex: 0;
        display: flex;
        border: 1px solid var(--gray-light);
        border-right: 0px;
        padding: 0 var(--spacing-xs);
        background-color: var(--reverse);
        color: var(--text-mid);
        border-radius: var(--radius-sm) 0 0 var(--radius-sm);
        line-height: 1;
        align-items: center;
        align-content: center;
        justify-content: center;
        z-index: 1;
      }

      &.prefix + :global(input),
      &.prefix + :global(select) {
        border-radius: 0px var(--radius-sm) var(--radius-sm) 0px;
      }

      :global(input),
      :global(select) {
        display: flex;
        margin: 0px;
        box-sizing: border-box;
        flex: 1 0 auto;
        border: 1px solid var(--gray-light);
        background-color: var(--gray-wash);
        border-radius: 9px;
        height: 48px;
        max-width: 100%;
        padding: 0 var(--spacing-xs);
        outline: none;
        font-family: var(--font-family);
        font-size: 1rem;
        line-height: 1;
        box-shadow: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        transition: all 200ms ease;
        z-index: 2;
      }

      :global(input)::-webkit-input-placeholder {
        color: ${hexa(theme.text.default, 0.35)};
        opacity: 1;
      }

      :global(input)::-moz-placeholder {
        color: ${hexa(theme.text.default, 0.35)};
        opacity: 1;
      }

      :global(input)::-ms-input-placeholder {
        color: ${hexa(theme.text.default, 0.35)};
        opacity: 1;
      }

      :global(input):focus,
      :global(select):focus {
        background-color: var(--reverse);
        border-color: var(--gray-default);
        box-shadow: 0 0 0px 3px ${hexa(theme.gray.default, 0.35)};
      }

      :global(input):disabled,
      :global(select):disabled {
        background: var(--gray-wash);
        color: var(--text-default);
        cursor: not-allowed;
      }

      :global(select) {
        line-height: 1.2;
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIZSURBVHgB7VdNSwJBGJ7ddbUooiDq4sVDdFEU9NAxCCIv/QBBEBV/lIgIoj+gixEIHT2paJcgkEAIvBiJoK4fvY/sgoizzo7XfWCYj33neR9mZ3eeUZgkksnkia7rD2gbhlEvl8tjJgGNScBKvlqtTqjr1TTNHwwG+51Ox2AO4VhAIpG48Hq9j9Q8IgFDqidUzkhEIBwO/7Tb7YkTPkcCstlsQFXVe8yj5L1SqfROCb8ikcgpjV0qinITi8XGzWbzV5RTWEAmkwkul8so2pT8g5I3rWckoh+NRjF+TcVPghQaG4jwCgkwk4c2kne3Y1qt1sASQStxJSpir4BUKnVH1e06WNMaxWLxkxcLEaFQaEyvyW+KOMXq2PErvAe5XE6fzWYPRHRBXWM6ndar1eqQCQAb1efz4RPVsVFp09bz+fzOL0Tlkczn8ziSUxlTuyaaHEAs5mAuOMDFi1XtiEAg+5PBHMwFB3PhwoULFy5swD2O0+n0M+pDHO+mcyYf8bIrxvY0hOsFAYiYZHLTOXPBFTAajV5hJkwRT+SMzpkgYEg8Hk8cc8FB7RovVtlHBktGZ3oAbViyQqHQs4uHc14sFrBxzHTODbv4vZ7QieO1c87SAgARxyvinKUFWCJ4jteJc97G3j2wjW3HuyaRcM4WHN8Nu93uhFbiGxdS6p5R8mPTOb9VKpU/5hBSt2PcgnEbhghKbhzys/oHKKNCfC4G3igAAAAASUVORK5CYII=');
        background-size: 16px 16px;
        background-repeat: no-repeat;
        background-position: right var(--spacing-xs) center;
        padding: 0 var(--spacing-xl) 0 var(--spacing-xs);
      }

      .dark :global(input) {
        background: var(--blue-dark);
        color: var(--reverse);
        border: 0px;
      }

      .dark :global(input):focus {
        box-shadow: 0 0 0px 3px rgba(255, 255, 255, 0.15);
      }

      .dark :global(input)::-webkit-input-placeholder {
        color: var(--text-mid);
        opacity: 1;
      }
      .dark :global(input)::-moz-placeholder {
        color: var(--text-mid);
        opacity: 1;
      }
      .dark :global(input)::-ms-input-placeholder {
        color: var(--text-mid);
        opacity: 1;
      }

      .transparent :global(input) {
        background: transparent;
        border: 0px;
        box-shadow: none;
      }

      .border :global(input) {
        background: transparent;
        border: 1px solid var(--reverse);
        color: var(--reverse);
      }
    `}</style>
  </div>
);

InputContainer.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  prefix: PropTypes.string,
};

export const TextInput = forwardRef(
  ({ onChange, prefix, variant, ...rest }, ref) => {
    const cx = classNames('input-container', variant, { prefix });

    return (
      <InputContainer className={cx} prefix={prefix}>
        <input type="text" onChange={onChange} ref={ref} {...rest} />
      </InputContainer>
    );
  }
);

TextInput.propTypes = {
  onChange: PropTypes.func,
  prefix: PropTypes.string,
  variant: PropTypes.string,
};

export const BooleanInput = ({
  value = false,
  onChange = () => null,
  disabled = false,
  ...rest
}) => {
  const [checked, setChecked] = useState(value);

  return (
    // eslint-disable-next-line
    <label disabled={disabled}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          setChecked(!checked);
          onChange(e);
        }}
        {...rest}
      />
      <span>
        <div />
      </span>

      <style jsx>{`
        position: relative;
        display: inline-block;
        width: 48px;
        height: 26px;
        user-select: none;
        outline: none;

        input {
          opacity: 0;
          width: 0;
          height: 0;
          outline: none;
        }

        input:checked,
        input:focused {
          outline: none;
          box-shadow: none;
        }

        input:checked + span {
          background-color: var(--green-default);
          border-color: var(--green-dark);
        }

        input:checked + span > div {
          transform: translateX(22px);
        }

        & > span {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--gray-light);
          border: 1px solid var(--gray-default);
          transition: 0.4s;
          border-radius: 26px;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
        }

        & > span:hover {
          border-color: var(--gray-dark);
        }

        & > span > div {
          background-color: white;
          position: absolute;
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          transition: 0.4s;
          border-radius: 50%;
          box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1),
            0px 0px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </label>
  );
};

BooleanInput.propTypes = {
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  value: PropTypes.bool,
  label: PropTypes.string,
};

export const SelectInput = ({
  onChange,
  value,
  variant,
  children,
  ...rest
}) => {
  const cx = classNames('input-container', variant);

  return (
    <InputContainer className={cx}>
      <select onChange={onChange} value={value} {...rest}>
        {children}
      </select>
    </InputContainer>
  );
};

SelectInput.propTypes = {
  onChange: PropTypes.func,
  children: PropTypes.node,
  value: PropTypes.any,
  variant: PropTypes.string,
  label: PropTypes.string,
};

export default TextInput;
