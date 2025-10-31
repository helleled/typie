import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Database as BunDatabase } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { logger } from '@typie/lib';
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
  const log = logger.getChild('db').getChild('migrations');
  
  try {
    // Check if database is initialized by checking for core tables
    const tableExists = sqlite.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    ).get();

    if (!tableExists) {
      log.info('Database not initialized, applying schema migrations...');
      
      // Read and execute SQL migration files
      const migrationFiles = [
        '0000_unknown_madame_masque.sql',
        '0001_good_photon.sql'
      ];
      
      for (const file of migrationFiles) {
        const migrationPath = `${dirname(dbPath)}/../drizzle/${file}`;
        log.info('Applying migration: {*}', { file });
        
        try {
          const migrationSql = await Bun.file(migrationPath).text();
          // Remove backticks from SQL to make it SQLite compatible
          const cleanedSql = migrationSql.replace(/`/g, '');
          sqlite.exec(cleanedSql);
          log.info('Migration applied successfully: {*}', { file });
        } catch (error) {
          log.error('Failed to apply migration {*}: {*} ', { file, error });
          throw error;
        }
      }
      
      log.info('Schema migrations completed');
    } else {
      log.info('Database already initialized, skipping schema migrations');
    }

    // Always ensure FTS tables exist (they're safe to recreate)
    log.info('Ensuring FTS tables exist...');
    try {
      const ftsPath = `${dirname(dbPath)}/../drizzle/0000_add_fts_tables.sql`;
      const ftsSql = await Bun.file(ftsPath).text();
      sqlite.exec(ftsSql);
      log.info('FTS tables ensured');
    } catch (error) {
      log.error('Failed to ensure FTS tables: {*}', { error });
      throw error;
    }
    
    log.info('Database migrations completed successfully');
  } catch (error) {
    log.error('Database migration failed: {*}', { error });
    throw error;
  }
}

export * from './schemas/codes';
export * from './schemas/id';
export * from './schemas/tables';
export * from './utils';
