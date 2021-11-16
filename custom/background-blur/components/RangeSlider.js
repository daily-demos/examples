import React, { useCallback, useMemo } from 'react';

const RangeSlider = ({ min, max, step, value, onChange }) => {
  const thumbStyles = `
    -webkit-appearance: none;
    background: #2B3F56;
    border: none;
    border-radius: 50%;
    height: var(--size);
    transition: box-shadow 200ms ease;
    width: var(--size);
  `;

  const getClassName = useCallback((i) => {
    if (i < value) return 'active'
    if (i === value) return 'current'
    return ''
  }, [value]);

  const ticks = useMemo(() => {
    if (!step) return null;
    const ticks = [];
    for (let i = min; i <= max; i += step) {
      ticks.push(
        <span
          key={i}
          className={`tick ${getClassName(i)}`}
        />
      );
    }
    return ticks;
  }, [step, min, max, getClassName]);

  const trackStyles = useMemo(() => {
    const bgColor = '#FFFFB7';
    const fillColor = '#2B3F56';
    const stop = `${(100 * value) / (max - min)}%`;
    return `
    -webkit-appearance: none;
    background: ${
      value
        ? `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${stop}, ${bgColor} ${stop}, ${bgColor} 100%)`
        : '#FFFFB7'
    };
    border-radius: calc(var(--size) / 2);
    border: none;
    color: transparent;
    height: var(--size);
    width: 100%;
  `;
  }, [max, min, value]);

  return (
    <div className="slider-wrapper">
      <input
        className="slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
      {ticks && (
        <div className="ticks" role="presentation">
          {ticks}
        </div>
      )}
      <div className="labels">
        <span className="minLabel">
          None
        </span>
        <span className="maxLabel">
          Full
        </span>
      </div>
      <style jsx>{`
        .slider-wrapper {
          --size: 18px;
          position: relative;
        }
        input[type='range'] {
          -webkit-appearance: none;
          margin: 0;
          width: 100%;
          height: var(--size);
          display: block;
          outline: none;
          border-radius: calc(var(--size) / 2);
        }
        .labels {
          justify-content: space-between;
          display: flex;
          margin-top: 8px;
        }
        .minLabel {
          margin-inline-end: auto;
        }
        .maxLabel {
          margin-inline-start: auto;
        }
        .ticks {
          display: flex;
          height: 4px;
          justify-content: space-between;
          left: 0;
          padding: 0 calc(var(--size) / 2);
          pointer-events: none;
          position: absolute;
          top: calc(calc(var(--size) - 4px) / 2);
          width: 100%;
        }
        .ticks :global(.tick) {
          background: #000;
          height: 4px;
          width: 1px;
        }
        .ticks :global(.tick.active) {
          background: #fff;
        }
        .ticks :global(.tick.current) {
          visibility: hidden;
        }
        input[type='range']::-webkit-slider-thumb {
          ${thumbStyles};
        }
        input[type='range']:not([disabled])::-webkit-slider-thumb {
          cursor: ew-resize;
        }
        input[type='range']::-moz-range-thumb {
          ${thumbStyles};
        }
        input[type='range']:not([disabled])::-moz-range-thumb {
          cursor: ew-resize;
        }
        input[type='range']::-ms-thumb {
          ${thumbStyles};
        }
        input[type='range']::-webkit-slider-runnable-track {
          ${trackStyles};
        }
        input[type='range']:not([disabled])::-webkit-slider-runnable-track {
          cursor: pointer;
        }
        input[type='range']::-moz-range-track {
          ${trackStyles};
        }
        input[type='range']:not([disabled])::-moz-range-track {
          cursor: pointer;
        }
        input[type='range']::-ms-track {
          ${trackStyles};
        }
      `}
      </style>
    </div>
  )
};

export default RangeSlider;
