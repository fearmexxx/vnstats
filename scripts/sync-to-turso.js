const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function sync() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env.local');
    process.exit(1);
  }

  console.log('Connecting to local database (data.db)...');
  const localDb = new Database('data.db');
  
  console.log(`Connecting to Turso at ${url}...`);
  const remoteDb = createClient({ url, authToken });

  // Order matters for foreign keys!
  const tables = ['firms', 'market_shares', 'social_metrics', 'market_accounts'];
  
  // 1. Delete in REVERSE order (children first)
  console.log('Cleaning remote database...');
  for (const table of [...tables].reverse()) {
    await remoteDb.execute(`DELETE FROM ${table}`);
  }

  // 2. Insert in FORWARD order (parents first)
  for (const table of tables) {
    console.log(`Syncing table: ${table}...`);
    
    // Get local data
    const rows = localDb.prepare(`SELECT * FROM ${table}`).all();
    if (rows.length === 0) {
      console.log(`Table ${table} is empty, skipping.`);
      continue;
    }

    // Get column names
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const colNames = columns.join(', ');

    console.log(`Pushing ${rows.length} rows to ${table}...`);
    
    for (const row of rows) {
      const values = Object.values(row);
      await remoteDb.execute({
        sql: `INSERT INTO ${table} (${colNames}) VALUES (${placeholders})`,
        args: values
      });
    }
  }

  console.log('Sync completed successfully!');
}

sync().catch(console.error);
