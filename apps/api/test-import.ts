#!/usr/bin/env bun

try {
  console.log('Testing import...');
  const storage = await import('@/storage/local');
  console.log('✅ Import successful');
  console.log('BUCKETS:', storage.BUCKETS);
  console.log('BUCKETS.usercontents:', storage.BUCKETS?.usercontents);
} catch (error) {
  console.error('❌ Import failed:', error);
}