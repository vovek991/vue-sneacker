const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function executeSqlFile(filePath) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true
  });

  try {
    const sqlContent = await fs.readFile(filePath, 'utf8');
    console.log(`Executing SQL from ${filePath}...`);
    await connection.query(sqlContent);
    console.log('SQL executed successfully');
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Выполняем SQL файл
const sqlFile = process.argv[2] || 'all_mysql.sql';
const sqlPath = path.join(__dirname, sqlFile);

executeSqlFile(sqlPath)
  .then(() => console.log('Done'))
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  }); 