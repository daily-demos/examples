import React from 'react';
import Button from '@custom/shared/components/Button';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@custom/shared/components/Card';
import PropTypes from 'prop-types';

export const MessageCard = ({
  header,
  children,
  error = false,
  hideBack = false,
  onBack,
}) => (
  <Card className={error ? 'error' : ''}>
    {header && <CardHeader>{header}</CardHeader>}
    {children && <CardBody>{children}</CardBody>}
    {!hideBack && (
      <CardFooter>
        {onBack ? (
          <Button onClick={() => onBack()}>Go back</Button>
        ) : (
          <Button onClick={() => window.location.reload()}>Go back</Button>
        )}
      </CardFooter>
    )}
    <style jsx>{`
      :global(.card.error) {
        border: 3px solid var(--red-default);
      }
    `}</style>
  </Card>
);

MessageCard.propTypes = {
  header: PropTypes.string,
  children: PropTypes.node,
  error: PropTypes.bool,
  onBack: PropTypes.func,
  hideBack: PropTypes.bool,
};

export default MessageCard;
