import { readFileSync, writeFileSync } from 'node:fs';

const filePath = './src/db/schemas/tables.ts';
let content = readFileSync(filePath, 'utf-8');

// Replace simple one-line index arrays
content = content.replace(
  /^(\s*)export const (\w+) = sqliteTable\(\s*\n\s*'([^']+)',\s*\n([\s\S]*?)\n(\s*)\(t\) => \[(.*?)\],\s*\n\);/gm,
  (match, indent, constName, tableName, fields, indent2, indexes) => {
    const indexDefs = indexes.trim().split(/,\s*(?=(?:index|unique))/);
    
    if (indexDefs.length === 0 || (indexDefs.length === 1 && !indexDefs[0])) {
      return match;
    }
    
    const indexObjects: string[] = [];
    indexDefs.forEach((indexDef, i) => {
      const trimmed = indexDef.trim().replace(/,$/, '');
      
      if (!trimmed) return;
      
      // Handle unique() constraints
      if (trimmed.match(/^unique\(\)\.on\(/)) {
        indexObjects.push(`    uniqueConstraint_${i}: ${trimmed},`);
        return;
      }
      
      // Handle index() or uniqueIndex()
      const match = trimmed.match(/^(index|uniqueIndex)\(\)\.on\(([^)]+)\)(.*)/);
      if (match) {
        const funcName = match[1];
        const columns = match[2];
        const extras = match[3];
        
        // Extract column names for index name
        const colNames = columns
          .split(',')
          .map(c => c.trim().replace(/^t\./, '').replace(/\W/g, '_'))
          .join('_');
        
        const indexType = funcName === 'uniqueIndex' ? 'unique_idx' : 'idx';
        const indexName = `${tableName}_${colNames}_${indexType}`;
        
        indexObjects.push(`    ${indexName}: ${funcName}('${indexName}').on(${columns})${extras},`);
      }
    });
    
    const indexBlock = indexObjects.length > 0 
      ? `${indent2}(t) => ({\n${indexObjects.join('\n')}\n${indent2}}),`
      : `${indent2}(t) => ({}),`;
    
    return `${indent}export const ${constName} = sqliteTable(\n  '${tableName}',\n${fields}\n${indexBlock}\n);`;
  }
);

// Handle multi-line index arrays
const lines = content.split('\n');
const result: string[] = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  
  // Find multi-line index arrays
  if (line.match(/^\s*\(t\) => \[\s*$/)) {
    // Find the table name
    let tableName = '';
    for (let j = i - 1; j >= 0; j--) {
      const match = lines[j].match(/sqliteTable\(\s*'([^']+)'/);
      if (match) {
        tableName = match[1];
        break;
      }
    }
    
    const indexLines: string[] = [];
    i++;
    
    // Collect all lines until closing bracket
    while (i < lines.length && !lines[i].match(/^\s*\],?\s*$/)) {
      indexLines.push(lines[i]);
      i++;
    }
    
    // Process the indexes
    const indexObjects: string[] = [];
    indexLines.forEach((indexLine, idx) => {
      const trimmed = indexLine.trim().replace(/,$/, '');
      
      if (!trimmed) return;
      
      // Handle unique() constraints
      if (trimmed.match(/^unique\(\)\.on\(/)) {
        indexObjects.push(`    uniqueConstraint_${idx}: ${trimmed},`);
        return;
      }
      
      // Handle uniqueIndex or index
      const match = trimmed.match(/^(index|uniqueIndex)\(\)\.on\(([^)]+)\)(.*)/);
      if (match) {
        const funcName = match[1];
        const columns = match[2];
        const extras = match[3];
        
        const colNames = columns
          .split(',')
          .map(c => c.trim().replace(/^t\./, '').replace(/\W/g, '_'))
          .join('_');
        
        const indexType = funcName === 'uniqueIndex' ? 'unique_idx' : 'idx';
        const indexName = `${tableName}_${colNames}_${indexType}`;
        
        indexObjects.push(`    ${indexName}: ${funcName}('${indexName}').on(${columns})${extras},`);
      }
    });
    
    result.push('  (t) => ({');
    result.push(...indexObjects);
    result.push('  }),');
    i++; // Skip the closing bracket
  } else {
    result.push(line);
  }
  
  i++;
}

writeFileSync(filePath, result.join('\n'), 'utf-8');
console.log('Fixed all indexes!');
