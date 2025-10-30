import { defineCron, defineJob } from '../types';

export const SubscriptionRenewalCron = defineCron('subscription:renewal', '0 10 * * *', async () => {
  return;
});

export const SubscriptionRenewalInitialJob = defineJob('subscription:renewal:initial', async () => {
  return;
});

export const SubscriptionRenewalRetryJob = defineJob('subscription:renewal:retry', async () => {
  return;
});

export const SubscriptionRenewalPlanChangeJob = defineJob('subscription:renewal:plan-change', async () => {
  return;
});

export const SubscriptionRenewalCancelJob = defineJob('subscription:renewal:cancel', async () => {
  return;
});
