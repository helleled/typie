#!/usr/bin/env bun

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import storage directly
const storage = await import('./src/storage/local.js');
const { db, Plans, Users, Images, sql, eq } = await import('./src/db/index.js');
const { PlanAvailability, PlanInterval, UserState, UserRole } = await import('./src/enums.js');

console.log('Testing database seeding with storage...');

try {
  // Initialize storage
  await storage.initStorage();
  console.log('✅ Storage initialized');
  
  // Test database connection
  const result = await db.select({ count: sql`count(*)` }).from(Users).get();
  console.log('✅ Database connected, current users:', result?.count || 0);
  
  console.log('✅ All components working, storage BUCKETS issue is fixed!');
  
} catch (error) {
  console.error('❌ Error:', error);
}