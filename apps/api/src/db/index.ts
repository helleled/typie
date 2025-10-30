import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Database as BunDatabase } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { env } from '@/env';
import { DrizzleLogger } from './logger';
import * as enums from './schemas/enums';
import * as tables from './schemas/tables';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

const dbPath = env.DATABASE_URL;
const dbDir = dirname(dbPath);

// Ensure database directory exists
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

export const sqlite = new BunDatabase(dbPath, { create: true });

export const db = drizzle(sqlite, {
  schema: { ...tables, ...enums },
  logger: new DrizzleLogger(),
});

export type Database = typeof db;
export type Transaction = BaseSQLiteDatabase<'sync', any, any>;

export async function runMigrations() {
  migrate(db, { migrationsFolder: './drizzle' });
}

export * from './schemas/codes';
export * from './schemas/id';
export * from './schemas/tables';
export * from './utils';
