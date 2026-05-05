const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = 'data.db';

// Delete existing DB for a clean start during migration
if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
}

const db = new Database(DB_PATH);

// Create Tables
db.exec(`
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
`);

// Migration Logic
const firmsData = [
  { id: 'VPS', name: 'VPS', fullName: 'VPS Securities', fb: 'https://facebook.com/vps.securities', tt: 'https://tiktok.com/@vps.securities', yt: 'https://youtube.com/@vpssecurities', share: 15.32 },
  { id: 'SSI', name: 'SSI', fullName: 'SSI Securities', fb: 'https://facebook.com/ssi.com.vn', tt: 'https://tiktok.com/@ssi.securities', yt: 'https://youtube.com/@ssisecurities', share: 11.14 },
  { id: 'TCBS', name: 'TCBS', fullName: 'Techcom Securities', fb: 'https://facebook.com/tcbs.com.vn', tt: 'https://tiktok.com/@tcbs_official', yt: 'https://youtube.com/@tcbs_official', share: 8.85 },
  { id: 'VCI', name: 'VCI', fullName: 'Vietcap Securities', fb: 'https://facebook.com/vietcapsecurities', tt: 'https://tiktok.com/@vietcap', yt: 'https://youtube.com/@vietcap', share: 7.35 },
  { id: 'HSC', name: 'HSC', fullName: 'Ho Chi Minh City Securities', fb: 'https://facebook.com/hscsecurities', tt: 'https://tiktok.com/@hsc_official', yt: 'https://youtube.com/@hscsecurities', share: 7.30 },
  { id: 'MBS', name: 'MBS', fullName: 'MB Securities', fb: 'https://facebook.com/mbs.securities', tt: 'https://tiktok.com/@mbs_securities', yt: 'https://youtube.com/@mbssecurities', share: 5.29 },
  { id: 'VND', name: 'VND', fullName: 'VNDIRECT Securities', fb: 'https://facebook.com/vndirect', tt: 'https://tiktok.com/@vndirect_official', yt: 'https://youtube.com/@vndirect', share: 4.78 },
  { id: 'KIS', name: 'KIS', fullName: 'KIS Vietnam Securities', fb: 'https://facebook.com/kisvietnam', tt: 'https://tiktok.com/@kisvietnam', yt: 'https://youtube.com/@kisvietnam', share: 3.21 },
  { id: 'VPBANKS', name: 'VPBankS', fullName: 'VPBank Securities', fb: 'https://facebook.com/vpbanksecurities', tt: 'https://tiktok.com/@vpbanksecurities', yt: 'https://youtube.com/@vpbanksecurities', share: 2.94 },
  { id: 'VCBS', name: 'VCBS', fullName: 'Vietcombank Securities', fb: 'https://facebook.com/vcbs.com.vn', tt: 'https://tiktok.com/@vcbs_official', yt: 'https://youtube.com/@vcbs_official', share: 2.87 },
  { id: 'MAS', name: 'MAS', fullName: 'Mirae Asset Securities', fb: 'https://facebook.com/miraeassetsecurities', tt: 'https://tiktok.com/@miraeasset', yt: 'https://youtube.com/@miraeasset', share: 2.70 },
  { id: 'FPTS', name: 'FPTS', fullName: 'FPT Securities', fb: 'https://facebook.com/fptsecurities', tt: 'https://tiktok.com/@fpts_official', yt: 'https://youtube.com/@fptsecurities', share: 2.50 },
  { id: 'DNSE', name: 'DNSE', fullName: 'DNSE Securities', fb: 'https://facebook.com/dnse.securities', tt: 'https://tiktok.com/@dnse_official', yt: 'https://youtube.com/@dnse_official', share: 2.30 },
  { id: 'BSC', name: 'BSC', fullName: 'BIDV Securities', fb: 'https://facebook.com/bidvsecurities', tt: 'https://tiktok.com/@bsc_securities', yt: 'https://youtube.com/@bidvsecurities', share: 2.10 },
  { id: 'ACBS', name: 'ACBS', fullName: 'ACB Securities', fb: 'https://facebook.com/acbsecurities', tt: 'https://tiktok.com/@acbs_official', yt: 'https://youtube.com/@acbsecurities', share: 1.90 },
];

const insertFirm = db.prepare('INSERT INTO firms (id, name, full_name, facebook_url, tiktok_url, youtube_url) VALUES (?, ?, ?, ?, ?, ?)');
const insertShare = db.prepare('INSERT INTO market_shares (firm_id, quarter, year, percentage) VALUES (?, ?, ?, ?)');

firmsData.forEach(f => {
    insertFirm.run(f.id, f.name, f.fullName, f.fb, f.tt, f.yt);
    insertShare.run(f.id, 'Q1', 2026, f.share);
});

// Load existing data
const accounts = JSON.parse(fs.readFileSync('src/data/market-accounts.json', 'utf8'));
const social = JSON.parse(fs.readFileSync('src/data/social-metrics.json', 'utf8'));

const insertAccount = db.prepare('INSERT INTO market_accounts (date, total_accounts, new_accounts) VALUES (?, ?, ?)');
accounts.history.forEach(h => {
    insertAccount.run(h.date, h.total, h.newAccounts);
});

const insertSocial = db.prepare('INSERT INTO social_metrics (firm_id, date, facebook_followers, tiktok_followers, youtube_subscribers) VALUES (?, ?, ?, ?, ?)');
// Mock data insertion removed to allow for real data entry from May 2026
// Object.entries(social.firms).forEach(([id, data]) => {
//     insertSocial.run(id, '2026-05', data.facebook, data.tiktok, Math.floor(data.facebook * 0.1));
//     insertSocial.run(id, '2026-04', Math.floor(data.facebook * 0.95), Math.floor(data.tiktok * 0.9), Math.floor(data.facebook * 0.09));
// });

console.log('Database initialized and migrated successfully.');
