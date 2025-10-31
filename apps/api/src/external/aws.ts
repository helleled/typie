import { CostExplorerClient } from '@aws-sdk/client-cost-explorer';
import { SESClient } from '@aws-sdk/client-ses';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { env } from '@/env';

export const ses = env.OFFLINE_MODE ? null : new SESClient();
export const costExplorer = env.OFFLINE_MODE ? null : new CostExplorerClient({ region: 'us-east-1' });

export const createFragmentedS3ObjectKey = () => {
  if (env.OFFLINE_MODE) {
    return 'offline-mode-stub-key';
  }

  const now = dayjs();
  const year = now.format('YY');
  const month = now.format('MM');

  const key = nanoid();
  const fragment = key[0];
  const subfragment = `${fragment}${key[1]}`;

  return `${year}/${month}/${fragment}/${subfragment}/${key}`;
};
