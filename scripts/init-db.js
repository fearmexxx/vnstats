const { createClient } = require('@libsql/client');
const Database = require('better-sqlite3');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function init() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  let db;

  if (url && url !== 'file:data.db') {
    console.log(`Initializing remote Turso database at ${url}...`);
    db = createClient({ url, authToken });
  } else {
    console.log('Initializing local SQLite database (data.db)...');
    const DB_PATH = 'data.db';
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
    }
    const localDb = new Database(DB_PATH);
    // Wrapper to match @libsql/client interface for basic exec
    db = {
      execute: (sql) => Promise.resolve(localDb.exec(sql)),
      prepare: (sql) => localDb.prepare(sql),
      isLocal: true,
      localDb
    };
  }

  const schema = `
    CREATE TABLE IF NOT EXISTS firms (
      id TEXT PRIMARY KEY,
      name TEXT,
      full_name TEXT,
      facebook_url TEXT,
      tiktok_url TEXT,
      youtube_url TEXT
    );

    CREATE TABLE IF NOT EXISTS market_shares (
      firm_id TEXT,
      quarter TEXT,
      year INTEGER,
      percentage REAL,
      PRIMARY KEY (firm_id, quarter, year),
      FOREIGN KEY (firm_id) REFERENCES firms(id)
    );

    CREATE TABLE IF NOT EXISTS social_metrics (
      firm_id TEXT,
      date TEXT, -- YYYY-MM
      facebook_followers INTEGER,
      tiktok_followers INTEGER,
      youtube_subscribers INTEGER,
      PRIMARY KEY (firm_id, date),
      FOREIGN KEY (firm_id) REFERENCES firms(id)
    );

    CREATE TABLE IF NOT EXISTS market_accounts (
      date TEXT PRIMARY KEY, -- DD/MM/YYYY
      total_accounts INTEGER,
      new_accounts INTEGER
    );
  `;

  if (db.isLocal) {
    db.localDb.exec(schema);
  } else {
    // Turso doesn't support multiple statements in one execute call usually, so we split
    const statements = schema.split(';').filter(s => s.trim());
    for (const s of statements) {
      await db.execute(s);
    }
  }

  // Initial Data
  const firmsData = [
    { id: 'VPS', name: 'VPS', fullName: 'VPS Securities', share: 15.32 },
    { id: 'SSI', name: 'SSI', fullName: 'SSI Securities', share: 11.14 },
    { id: 'TCBS', name: 'TCBS', fullName: 'Techcom Securities', share: 8.85 },
    { id: 'VCI', name: 'VCI', fullName: 'Vietcap Securities', share: 7.35 },
    { id: 'HSC', name: 'HSC', fullName: 'Ho Chi Minh City Securities', share: 7.30 },
    { id: 'MBS', name: 'MBS', fullName: 'MB Securities', share: 5.29 },
    { id: 'VND', name: 'VND', fullName: 'VNDIRECT Securities', share: 4.78 },
    { id: 'KIS', name: 'KIS', fullName: 'KIS Vietnam Securities', share: 3.21 },
    { id: 'VPBANKS', name: 'VPBankS', fullName: 'VPBank Securities', share: 2.94 },
    { id: 'VCBS', name: 'VCBS', fullName: 'Vietcombank Securities', share: 2.87 },
    { id: 'MAS', name: 'MAS', fullName: 'Mirae Asset Securities', share: 2.70 },
    { id: 'FPTS', name: 'FPTS', fullName: 'FPT Securities', share: 2.50 },
    { id: 'DNSE', name: 'DNSE', fullName: 'DNSE Securities', share: 2.30 },
    { id: 'BSC', name: 'BSC', fullName: 'BIDV Securities', share: 2.10 },
    { id: 'ACBS', name: 'ACBS', fullName: 'ACB Securities', share: 1.90 },
  ];

  console.log('Inserting seed data...');
  for (const f of firmsData) {
    if (db.isLocal) {
      db.localDb.prepare('INSERT INTO firms (id, name, full_name) VALUES (?, ?, ?)').run(f.id, f.name, f.fullName);
      db.localDb.prepare('INSERT INTO market_shares (firm_id, quarter, year, percentage) VALUES (?, ?, ?, ?)').run(f.id, 'Q1', 2026, f.share);
    } else {
      await db.execute({
        sql: 'INSERT INTO firms (id, name, full_name) VALUES (?, ?, ?)',
        args: [f.id, f.name, f.fullName]
      });
      await db.execute({
        sql: 'INSERT INTO market_shares (firm_id, quarter, year, percentage) VALUES (?, ?, ?, ?)',
        args: [f.id, 'Q1', 2026, f.share]
      });
    }
  }

  // Load Market Accounts
  if (fs.existsSync('src/data/market-accounts.json')) {
    console.log('Loading market accounts from JSON...');
    const accounts = JSON.parse(fs.readFileSync('src/data/market-accounts.json', 'utf8'));
    for (const h of accounts.history) {
      if (db.isLocal) {
        db.localDb.prepare('INSERT INTO market_accounts (date, total_accounts, new_accounts) VALUES (?, ?, ?)').run(h.date, h.total, h.newAccounts);
      } else {
        await db.execute({
          sql: 'INSERT INTO market_accounts (date, total_accounts, new_accounts) VALUES (?, ?, ?)',
          args: [h.date, h.total, h.newAccounts]
        });
      }
    }
  }

  console.log('Database initialization complete.');
}

init().catch(console.error);
