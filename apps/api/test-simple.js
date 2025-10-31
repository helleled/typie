console.log('Testing BUCKETS import...');

try {
  // Try to require the compiled version
  const fs = require('fs');
  const path = require('path');
  
  // Check if the file exists
  const storagePath = path.join(__dirname, 'src/storage/local.ts');
  console.log('Storage path:', storagePath);
  console.log('File exists:', fs.existsSync(storagePath));
  
  if (fs.existsSync(storagePath)) {
    const content = fs.readFileSync(storagePath, 'utf8');
    console.log('File content preview:');
    console.log(content.substring(0, 200));
    
    // Check for BUCKETS export
    if (content.includes('export const BUCKETS')) {
      console.log('✅ BUCKETS export found');
    } else {
      console.log('❌ BUCKETS export not found');
    }
  }
} catch (error) {
  console.error('Error:', error);
}