import React from 'react';
import { Card, CardBody, CardHeader } from '@custom/shared/components/Card';

export const NotConfigured = () => (
  <Card>
    <CardHeader>Environmental variables not set</CardHeader>
    <CardBody>
      <p>
        Please ensure you have set both the <code>DAILY_API_KEY</code> and{' '}
        <code>DAILY_DOMAIN</code> environmental variables. An example can be
        found in the provided <code>env.example</code> file.
      </p>
      <p>
        If you do not yet have a Daily developer account, please{' '}
        <a
          href="https://dashboard.daily.co/signup"
          target="_blank"
          rel="noreferrer"
        >
          create one now
        </a>
        . You can find your Daily API key on the{' '}
        <a
          href="https://dashboard.daily.co/developers"
          target="_blank"
          rel="noreferrer"
        >
          developer page
        </a>{' '}
        of the dashboard.
      </p>
    </CardBody>
  </Card>
);

export default NotConfigured;
