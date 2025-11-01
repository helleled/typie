#!/usr/bin/env bun

import * as storage from '@/storage/local';

console.log('Testing BUCKETS export...');
console.log('storage.BUCKETS:', storage.BUCKETS);
console.log('storage.BUCKETS.usercontents:', storage.BUCKETS.usercontents);
console.log('storage.BUCKETS.uploads:', storage.BUCKETS.uploads);

try {
  await storage.initStorage();
  console.log('✅ Storage initialized successfully');
  
  // Test putObject
  await storage.putObject({
    bucket: storage.BUCKETS.usercontents,
    key: 'test/hello.txt',
    body: Buffer.from('Hello, World!'),
    contentType: 'text/plain',
  });
  console.log('✅ putObject works');
  
  // Test getObject
  const obj = await storage.getObject({
    bucket: storage.BUCKETS.usercontents,
    key: 'test/hello.txt',
  });
  console.log('✅ getObject works:', obj.body.toString());
  
} catch (error) {
  console.error('❌ Error:', error);
}