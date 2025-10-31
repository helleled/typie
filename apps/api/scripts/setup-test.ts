#!/usr/bin/env node

import { existsSync, unlinkSync } from 'node:fs';
import { logger } from '@typie/lib';
import { db, sqlite } from '@/db';

const log = logger.getChild('setup-test');

async function runSetupTest() {
  log.info('Starting database setup test...');
  
  const dbPath = './data/typie.db';
  
  try {
    // Clean up existing database if it exists
    if (existsSync(dbPath)) {
      log.info('Removing existing database...');
      unlinkSync(dbPath);
    }
    
    // Start the API server to trigger automatic setup
    log.info('Starting API server to trigger database setup...');
    
    // Import and run the main application
    const { runMigrations } = await import('@/db');
    const { seedDatabase } = await import('../scripts/seed');
    const storage = await import('@/storage/local');
    
    // Initialize storage
    await storage.initStorage();
    
    // Run migrations
    log.info('Running migrations...');
    await runMigrations();
    
    // Seed database
    log.info('Seeding database...');
    await seedDatabase();
    
    // Verify core tables exist
    log.info('Verifying database schema...');
    
    const coreTables = [
      'users',
      'sites', 
      'entities',
      'posts',
      'post_contents',
      'canvases',
      'plans',
      'posts_fts',
      'canvases_fts'
    ];
    
    const missingTables: string[] = [];
    
    for (const table of coreTables) {
      const result = sqlite.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
      ).get(table);
      
      if (!result) {
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      log.error('Missing core tables: {*}', { tables: missingTables });
      throw new Error(`Missing tables: ${missingTables.join(', ')}`);
    }
    
    // Verify plans table is seeded
    const planCount = sqlite.prepare("SELECT COUNT(*) as count FROM plans").get() as { count: number };
    
    if (planCount.count !== 4) {
      log.error('Plans table not properly seeded. Expected 4 plans, found {*}', { count: planCount.count });
      throw new Error(`Expected 4 plans, found ${planCount.count}`);
    }
    
    // Verify FTS tables work
    log.info('Testing FTS functionality...');
    
    // Test that FTS tables accept inserts
    sqlite.prepare("INSERT INTO posts_fts(id, site_id, title, subtitle, text) VALUES(?, ?, ?, ?, ?)")
      .run('test-post', 'test-site', 'Test Title', 'Test Subtitle', 'Test content');
    
    sqlite.prepare("INSERT INTO canvases_fts(id, site_id, title) VALUES(?, ?, ?)")
      .run('test-canvas', 'test-site', 'Test Canvas');
      
    // Test FTS search
    const postResults = sqlite.prepare("SELECT * FROM posts_fts WHERE posts_fts MATCH ?")
      .all('Test');
    
    const canvasResults = sqlite.prepare("SELECT * FROM canvases_fts WHERE canvases_fts MATCH ?")
      .all('Test');
    
    if (postResults.length !== 1 || canvasResults.length !== 1) {
      log.error('FTS search not working properly. Post results: {*}, Canvas results: {*}', { 
        postResults: postResults.length, 
        canvasResults: canvasResults.length 
      });
      throw new Error('FTS search functionality failed');
    }
    
    // Clean up test data
    sqlite.prepare("DELETE FROM posts_fts WHERE id = ?").run('test-post');
    sqlite.prepare("DELETE FROM canvases_fts WHERE id = ?").run('test-canvas');
    
    log.info('✅ Database setup test completed successfully!');
    log.info('✅ All core tables exist');
    log.info('✅ Database seeding completed');
    log.info('✅ FTS tables created and functional');
    
  } catch (error) {
    log.error('❌ Database setup test failed: {*}', { error });
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  await runSetupTest();
  process.exit(0);
}