import { SendEmailCommand } from '@aws-sdk/client-ses';
import { render } from '@react-email/components';
import { env } from '@/env';
import * as aws from '@/external/aws';
import type * as React from 'react';

type SendEmailParams = {
  subject: string;
  recipient: string;
  body: React.ReactElement;
};

export const sendEmail = async ({ subject, recipient, body }: SendEmailParams) => {
  if (env.OFFLINE_MODE) {
    const renderedBody = await render(body);
    console.log('[Email Outbox]', JSON.stringify({ subject, recipient, bodyLength: renderedBody.length }));
    return;
  }

  if (!aws.ses) {
    console.warn('[Email] SES client not available, skipping email send');
    return;
  }

  await aws.ses.send(
    new SendEmailCommand({
      Source: '타이피 <hello@typie.co>',
      Destination: {
        ToAddresses: [recipient],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Html: {
            Data: await render(body),
          },
        },
      },
    }),
  );
};
