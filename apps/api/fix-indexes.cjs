const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/db/schemas/tables.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Function to generate index name from table name and columns
function generateIndexName(tableName, columns, type = 'idx') {
  const columnsPart = columns.map(c => c.replace(/^t\./, '')).join('_');
  return `${tableName}_${columnsPart}_${type}`;
}

// Replace array-style indexes with object-style indexes
const lines = content.split('\n');
const result = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  
  // Check if this is an index definition line
  if (line.match(/^\s*\(t\) => \[.*\],?\s*$/)) {
    // This is a single-line index array - we need to convert it
    const tableName = result[result.length - 2].match(/sqliteTable\(\s*['"](\w+)['"]/)?.[1];
    
    if (tableName) {
      const indexMatches = line.matchAll(/(?:index|uniqueIndex|unique)\(\)\.on\(([^)]+)\)(?:\.where\([^)]+\))?/g);
      const indexes = Array.from(indexMatches);
      
      if (indexes.length > 0) {
        result.push(`  (t) => ({`);
        
        indexes.forEach((match, idx) => {
          const columns = match[1].split(',').map(c => c.trim());
          const isUnique = match[0].includes('uniqueIndex');
          const isUniqueConstraint = match[0].includes('unique()');
          const hasWhere = match[0].includes('.where(');
          
          let indexType = 'idx';
          let indexFunc = 'index';
          if (isUnique) {
            indexType = 'unique_idx';
            indexFunc = 'uniqueIndex';
          } else if (isUniqueConstraint) {
            // unique constraints don't need names
            result.push(`    unique_${idx}: unique().on(${match[1]})${hasWhere ? match[0].match(/\.where\([^)]+\)/)?.[0] : ''},`);
            return;
          }
          
          const indexName = generateIndexName(tableName, columns, indexType);
          const whereClause = hasWhere ? match[0].match(/\.where\([^)]+\)/)?.[0] : '';
          result.push(`    ${indexName.replace(/\./g, '_')}: ${indexFunc}('${indexName}').on(${match[1]})${whereClause},`);
        });
        
        result.push(`  }),`);
      } else {
        result.push(line);
      }
    } else {
      result.push(line);
    }
  } else if (line.match(/^\s*\(t\) => \[\s*$/)) {
    // Multi-line index array - find the closing bracket
    const tableName = result[result.length - 2].match(/sqliteTable\(\s*['"](\w+)['"]/)?.[1];
    const indexLines = [line];
    i++;
    
    while (i < lines.length && !lines[i].match(/^\s*\],?\s*$/)) {
      indexLines.push(lines[i]);
      i++;
    }
    indexLines.push(lines[i]); // Add the closing bracket
    
    if (tableName) {
      result.push(`  (t) => ({`);
      
      let indexCounter = 0;
      indexLines.slice(1, -1).forEach(indexLine => {
        const trimmed = indexLine.trim();
        
        if (trimmed.match(/^unique\(\)\.on\(/)) {
          // Keep unique constraints as-is (just reformat)
          result.push(`    unique_${indexCounter++}: ${trimmed}`);
        } else if (trimmed.match(/^(index|uniqueIndex)\(\)\.on\(/)) {
          const match = trimmed.match(/^(index|uniqueIndex)\(\)\.on\(([^)]+)\)(\.where\([^)]+\))?/);
          if (match) {
            const indexFunc = match[1];
            const columns = match[2].split(',').map(c => c.trim().replace(/^t\./, ''));
            const whereClause = match[3] || '';
            
            const indexType = indexFunc === 'uniqueIndex' ? 'unique_idx' : 'idx';
            const indexName = generateIndexName(tableName, columns.map(c => `t.${c}`), indexType);
            
            result.push(`    ${indexName}: ${indexFunc}('${indexName}').on(${match[2]})${whereClause}${trimmed.endsWith(',') ? ',' : ''}`);
          }
        } else if (trimmed) {
          result.push(indexLine);
        }
      });
      
      result.push(`  }),`);
    } else {
      result.push(...indexLines);
    }
  } else {
    result.push(line);
  }
  
  i++;
}

fs.writeFileSync(filePath, result.join('\n'), 'utf-8');
console.log('Fixed indexes in tables.ts');
