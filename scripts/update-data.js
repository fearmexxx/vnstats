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
    const content = await page.textContent('body');
    
    // Pattern search in snippets for "X followers" or "X subscribers"
    const fbMatch = content.match(/([\d.,]+[KM]?)\s*followers/i);
    const subMatch = content.match(/([\d.,]+[KM]?)\s*subscribers/i);
    const likeMatch = content.match(/([\d.,]+[KM]?)\s*likes/i);
    
    return fbMatch?.[1] || subMatch?.[1] || likeMatch?.[1] || null;
  } catch (e) {
    console.error(`Error searching for ${query}:`, e.message);
    return null;
  }
}

async function updateData() {
  console.log('Starting headless social crawl via Google Search...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const firms = db.prepare('SELECT id, name FROM firms').all();
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
    console.log(`Processing ${firm.name}...`);
    
    // Search Facebook
    const fbRaw = await getStatsFromGoogle(page, `site:facebook.com "${firm.name}" followers`);
    const fbCount = await parseCount(fbRaw);
    
    // Search TikTok
    const ttRaw = await getStatsFromGoogle(page, `site:tiktok.com "@${firm.name.toLowerCase()}" followers`);
    const ttCount = await parseCount(ttRaw);
    
    // Search YouTube
    const ytRaw = await getStatsFromGoogle(page, `site:youtube.com "${firm.name}" subscribers`);
    const ytCount = await parseCount(ytRaw);

    console.log(`-> ${firm.name}: FB: ${fbCount}, TT: ${ttCount}, YT: ${ytCount}`);

    insertSocial.run(firm.id, currentDate, fbCount || 0, ttCount || 0, ytCount || 0);
    
    // Small delay to avoid Google rate limit
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();
  console.log('Social crawl complete.');
}

updateData().catch(console.error);
