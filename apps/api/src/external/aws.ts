import { CostExplorerClient } from '@aws-sdk/client-cost-explorer';
import { SESClient } from '@aws-sdk/client-ses';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

export const ses = new SESClient();
export const costExplorer = new CostExplorerClient({ region: 'us-east-1' });

export const createFragmentedS3ObjectKey = () => {
  const now = dayjs();
  const year = now.format('YY');
  const month = now.format('MM');

  const key = nanoid();
  const fragment = key[0];
  const subfragment = `${fragment}${key[1]}`;

  return `${year}/${month}/${fragment}/${subfragment}/${key}`;
};
