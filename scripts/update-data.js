const { chromium } = require('playwright');
const Database = require('better-sqlite3');
const db = new Database('data.db');

async function parseCount(text) {
  if (!text) return 0;
  const match = text.match(/([\d.,]+)\s*([KMkmbB]?)/);
  if (!match) return 0;
  
  let num = parseFloat(match[1].replace(/,/g, ''));
  const unit = match[2].toUpperCase();
  
  if (unit === 'K') num *= 1000;
  if (unit === 'M') num *= 1000000;
  if (unit === 'B') num *= 1000000000;
  
  return Math.floor(num);
}

async function getStatsFromGoogle(page, query) {
  try {
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle' });
    const results = await page.$$eval('div.g', (elements) => {
      return elements.map(el => el.textContent).join(' ');
    });
    
    // Look for various patterns of follower/subscriber counts
    // We prioritize patterns that include "verified", "official", or just high numbers
    const followers = results.match(/([\d.,]+[KM]?)\s*(followers|subscribers|người theo dõi|đăng ký)/gi);
    
    if (!followers) return null;

    // Convert all found matches to numbers and pick the highest one (likely the official page)
    const numericValues = await Promise.all(followers.map(f => parseCount(f)));
    const highest = Math.max(...numericValues);
    
    return highest > 0 ? highest : null;
  } catch (e) {
    console.error(`Error searching for ${query}:`, e.message);
    return null;
  }
}

async function updateData() {
  console.log('Starting enhanced headless social crawl via Google Search...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const firms = db.prepare('SELECT id, name, full_name FROM firms').all();
  const now = new Date();
  const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const insertSocial = db.prepare(`
    INSERT INTO social_metrics (firm_id, date, facebook_followers, tiktok_followers, youtube_subscribers)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(firm_id, date) DO UPDATE SET
      facebook_followers = excluded.facebook_followers,
      tiktok_followers = excluded.tiktok_followers,
      youtube_subscribers = excluded.youtube_subscribers
  `);

  for (const firm of firms) {
    console.log(`Processing Official Entity: ${firm.full_name} (${firm.id})...`);
    
    // Improved Queries using Full Legal/Official Name
    const fbCount = await getStatsFromGoogle(page, `site:facebook.com "${firm.full_name}" followers official`);
    const ttCount = await getStatsFromGoogle(page, `site:tiktok.com "${firm.full_name}" followers official`);
    const ytCount = await getStatsFromGoogle(page, `site:youtube.com "${firm.full_name}" subscribers official`);

    console.log(`-> ${firm.id} RESULTS: FB: ${fbCount || 'N/A'}, TT: ${ttCount || 'N/A'}, YT: ${ytCount || 'N/A'}`);

    // If Google search fails to find a high enough number, we keep previous data or default to 0
    const lastData = db.prepare('SELECT * FROM social_metrics WHERE firm_id = ? ORDER BY date DESC LIMIT 1').get(firm.id);
    
    insertSocial.run(
      firm.id, 
      currentDate, 
      fbCount || lastData?.facebook_followers || 0, 
      ttCount || lastData?.tiktok_followers || 0, 
      ytCount || lastData?.youtube_subscribers || 0
    );
    
    await new Promise(r => setTimeout(r, 3000));
  }

  await browser.close();
  console.log('Social crawl complete.');
}

updateData().catch(console.error);
