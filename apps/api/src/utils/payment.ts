import dayjs from 'dayjs';
import { match } from 'ts-pattern';
import { PlanInterval } from '@/enums';

export const getSubscriptionExpiresAt = (startsAt: dayjs.Dayjs, interval: PlanInterval) => {
  if (interval === PlanInterval.LIFETIME) {
    return dayjs('9999-12-31T00:00:00.000Z');
  }

  const startOfMonth = startsAt.kst().startOf('month').startOf('day');
  const expiresAtMonth = match(interval)
    .with(PlanInterval.MONTHLY, () => startOfMonth.add(1, 'month'))
    .with(PlanInterval.YEARLY, () => startOfMonth.add(1, 'year'))
    .exhaustive();

  return expiresAtMonth.date(Math.min(startsAt.kst().date(), expiresAtMonth.daysInMonth()));
};
