#!/usr/bin/env bun

// Simple test for storage BUCKETS issue
console.log('Testing storage BUCKETS issue fix...');

try {
  // Import storage module
  const storage = await import('./src/storage/local.js');
  
  console.log('✅ Storage module imported successfully');
  console.log('BUCKETS:', storage.BUCKETS);
  console.log('BUCKETS.usercontents:', storage.BUCKETS.usercontents);
  console.log('BUCKETS.uploads:', storage.BUCKETS.uploads);
  
  // Test initialization
  await storage.initStorage();
  console.log('✅ Storage initialized successfully');
  
  // Test putObject with usercontents bucket
  await storage.putObject({
    bucket: storage.BUCKETS.usercontents,
    key: 'images/test-avatar.png',
    body: Buffer.from('fake image data'),
    contentType: 'image/png',
    tags: {
      UserId: 'test-user',
    },
  });
  console.log('✅ putObject with usercontents bucket works');
  
  // Test getObject
  const obj = await storage.getObject({
    bucket: storage.BUCKETS.usercontents,
    key: 'images/test-avatar.png',
  });
  console.log('✅ getObject works, content length:', obj.contentLength);
  console.log('✅ Tags:', obj.tags);
  
  console.log('');
  console.log('🎉 SUCCESS: storage.BUCKETS reference error is FIXED!');
  console.log('The original error "undefined is not an object (evaluating \'storage.BUCKETS.usercontents\')" should no longer occur.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}