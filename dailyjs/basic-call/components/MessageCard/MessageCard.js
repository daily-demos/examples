import React from 'react';
import Button from '@dailyjs/shared/components/Button';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@dailyjs/shared/components/Card';
import PropTypes from 'prop-types';

export const MessageCard = ({ header, children, error = false, onBack }) => (
  <Card>
    {header && <CardHeader>{header}</CardHeader>}
    {children && <CardBody>{children}</CardBody>}
    <CardFooter>
      {onBack ? (
        <Button onClick={() => onBack()}>Go back</Button>
      ) : (
        <Button href="/">Go back</Button>
      )}
    </CardFooter>
    {error && (
      <style jsx>{`
        .card {
          border: 3px solid var(--red-default);
        }
      `}</style>
    )}
  </Card>
);

MessageCard.propTypes = {
  header: PropTypes.string,
  children: PropTypes.node,
  error: PropTypes.bool,
  onBack: PropTypes.func,
};

export default MessageCard;
