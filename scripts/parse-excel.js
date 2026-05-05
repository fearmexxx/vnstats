const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');
const Database = require('better-sqlite3');
require('dotenv').config({ path: '.env.local' });

const EXCEL_FILE = 'So luong tai khoan nha dau tu den cuoi thang 03 nam 2026_1776307669353.xlsx';
const OUTPUT_FILE = 'src/data/market-accounts.json';

async function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url && url !== 'file:data.db') {
    console.log(`Connecting to Turso: ${url}`);
    return createClient({ url, authToken });
  } else {
    console.log('Connecting to local data.db');
    const localDb = new Database('data.db');
    return {
      execute: (sql, args) => Promise.resolve(localDb.prepare(sql).run(args || []))
    };
  }
}

async function parseExcel() {
  console.log(`Reading ${EXCEL_FILE}...`);
  const workbook = xlsx.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const rows = data.slice(6);
  
  const history = rows.map((row, index) => {
    const date = row[0];
    const total = row[5];
    const totalNum = typeof total === 'string' ? parseInt(total.replace(/\./g, '')) : total;
    
    return {
      date,
      total: totalNum
    };
  }).filter(r => r.date && r.total);

  const processedHistory = history.map((curr, idx) => {
    if (idx === 0) return { ...curr, newAccounts: 0 };
    const prev = history[idx - 1];
    return {
      ...curr,
      newAccounts: curr.total - prev.total
    };
  });

  const latest = processedHistory[processedHistory.length - 1];

  const result = {
    lastUpdated: latest.date,
    latestTotal: latest.total,
    latestNewAccounts: latest.newAccounts,
    history: processedHistory
  };

  if (!fs.existsSync('src/data')) {
    fs.mkdirSync('src/data', { recursive: true });
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`Successfully saved to ${OUTPUT_FILE}`);

  // Update Database
  console.log('Updating database with new account data...');
  const db = await getDb();
  
  for (const h of processedHistory) {
    await db.execute(
      'INSERT INTO market_accounts (date, total_accounts, new_accounts) VALUES (?, ?, ?) ON CONFLICT(date) DO UPDATE SET total_accounts = excluded.total_accounts, new_accounts = excluded.new_accounts',
      [h.date, h.total, h.newAccounts]
    );
  }
  
  console.log('Database update complete.');
}

parseExcel().catch(console.error);
