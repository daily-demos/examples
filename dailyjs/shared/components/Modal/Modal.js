import React, { cloneElement, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import noScroll from 'no-scroll';
import { createPortal } from 'react-dom';
import { ReactComponent as IconClose } from '../../icons/close-sm.svg';
import Button from '../Button';
import { Card, CardBody, CardFooter, CardHeader } from '../Card';

const transitionMs = 350;

export const Modal = ({
  children,
  actions = [],
  hideOnBackdropClick = true,
  locked = false,
  isOpen = false,
  onClose,
  showCloseButton = true,
  title = null,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      noScroll.on();
    }
    return () => noScroll.off();
  }, [isOpen]);

  const close = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, transitionMs);
  };

  const handleBackdropClick = (ev) => {
    const isBackDropTarget = ev.target === ev.currentTarget;
    const isFocusOutside = !ev.currentTarget.contains(document.activeElement);
    // close only if backdrop is actually clicked
    if (isBackDropTarget && isFocusOutside && hideOnBackdropClick && !locked) {
      close();
    }
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className={classNames('backdrop', { isVisible })}
      onClick={handleBackdropClick}
      role="presentation"
      {...props}
    >
      <div
        className="modal"
        ref={modalRef}
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        {showCloseButton && (
          <Button
            size="medium-square"
            variant="translucent"
            className="closeButton"
            onClick={() => close()}
          >
            <IconClose />
          </Button>
        )}
        <Card noBorder shadow>
          {title && <CardHeader>{title}</CardHeader>}
          <CardBody>{children}</CardBody>
        </Card>

        {actions.length > 0 && (
          <CardFooter>
            {actions.map((child, i) =>
              cloneElement(child, {
                key: `action${i}`,
                onClick: () => {
                  if (child.props?.onClick) {
                    child.props?.onClick?.(close);
                  } else {
                    close();
                  }
                },
              })
            )}
          </CardFooter>
        )}
      </div>
      <style jsx>{`
        .backdrop {
          background-color: rgba(0, 0, 0, 0);
          bottom: 0;
          left: 0;
          overflow-y: auto;
          position: fixed;
          right: 0;
          top: 0;
          transition: background ${transitionMs}ms ease;
          z-index: 999;
        }

        .backdrop .modal {
          margin: 40px auto;
          opacity: 0;
          transform: scale(0.95);
          transition: opacity ${transitionMs}ms ease,
            transform ${transitionMs}ms ease;
          width: 90vw;
          max-width: 560px;
        }

        .backdrop .modal :global(.card-footer) {
          border-top: 0px;
          display: flex;
          column-gap: var(--spacing-xs);
          margin-top: var(--spacing-sm);
        }

        .isVisible {
          background-color: rgba(0, 0, 0, 0.75);
        }

        .isVisible .modal {
          opacity: 1;
          transform: scale(1);
        }

        .backdrop :global(.closeButton) {
          position: absolute;
          top: 0px;
          right: calc(0px - 48px - var(--spacing-xs));
        }
      `}</style>
    </div>,
    document.body
  );
};

export default React.memo(Modal, (p, n) => p.open === n.open);
