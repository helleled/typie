import dayjs from 'dayjs';
import { customType } from 'drizzle-orm/sqlite-core';

export const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
  dataType: () => 'blob',
  toDriver: (value) => value,
  fromDriver: (value) => value,
});

export const datetime = customType<{ data: dayjs.Dayjs; driverData: string }>({
  dataType: () => 'text',
  fromDriver: (value) => dayjs(value),
  toDriver: (value) => value.toISOString(),
});

export const jsonb = customType<{ data: unknown; driverData: string }>({
  dataType: () => 'text',
  toDriver: (value) => JSON.stringify(value),
  fromDriver: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
});
