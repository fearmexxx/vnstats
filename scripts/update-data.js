const Database = require('better-sqlite3');
const db = new Database('data.db');

async function updateData() {
  console.log('Starting data update...');

  const now = new Date();
  const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // 1. In a real scenario, you'd crawl social channels here
  // For now, we simulate growth
  const firms = db.prepare('SELECT id FROM firms').all();
  const insertSocial = db.prepare(\`
    INSERT INTO social_metrics (firm_id, date, facebook_followers, tiktok_followers, youtube_subscribers)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(firm_id, date) DO UPDATE SET
      facebook_followers = excluded.facebook_followers,
      tiktok_followers = excluded.tiktok_followers,
      youtube_subscribers = excluded.youtube_subscribers
  \`);

  firms.forEach(firm => {
    // Get last metrics to simulate growth
    const last = db.prepare('SELECT * FROM social_metrics WHERE firm_id = ? ORDER BY date DESC LIMIT 1').get(firm.id);
    if (last) {
      insertSocial.run(
        firm.id,
        currentDate,
        Math.floor(last.facebook_followers * (1 + Math.random() * 0.02)),
        Math.floor(last.tiktok_followers * (1 + Math.random() * 0.05)),
        Math.floor(last.youtube_subscribers * (1 + Math.random() * 0.03))
      );
    }
  });

  console.log('Data update complete.');
}

updateData().catch(console.error);
