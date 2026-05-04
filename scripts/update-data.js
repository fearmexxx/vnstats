const { chromium } = require('playwright');
const Database = require('better-sqlite3');
const db = new Database('data.db');

async function parseCount(text) {
  if (!text) return 0;
  // Handle Vietnamese "Tr" for Million
  let cleanText = text.replace(/,/g, '').replace(/Tr/i, 'M').trim();
  
  const match = cleanText.match(/([\d.]+)\s*([KMB]?)/i);
  if (!match) return 0;
  
  let num = parseFloat(match[1]);
  const unit = (match[2] || '').toUpperCase();
  
  if (unit === 'K') num *= 1000;
  if (unit === 'M') num *= 1000000;
  if (unit === 'B') num *= 1000000000;
  
  return Math.floor(num);
}

async function getStatsFromSearch(page, query) {
  try {
    // Switch to Bing which is often more lenient than Google
    await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const content = await page.evaluate(() => document.body.innerText);
    
    // Patterns for Vietnamese and English social metrics
    const patterns = [
      /([\d.,]+[KMTTr]?)\s*(followers|subscribers|người theo dõi|người đăng ký|đăng ký|likes)/gi,
      /(Theo dõi|Followers):\s*([\d.,]+[KMTTr]?)/gi
    ];
    
    let matches = [];
    for (const pattern of patterns) {
      const found = content.match(pattern);
      if (found) matches = [...matches, ...found];
    }
    
    if (matches.length === 0) return null;

    const numericValues = await Promise.all(matches.map(async (m) => {
      const clean = m.replace(/followers|subscribers|người theo dõi|người đăng ký|đăng ký|likes|Theo dõi|:/gi, '').trim();
      return parseCount(clean);
    }));

    return Math.max(...numericValues);
  } catch (e) {
    console.error(`Error searching for ${query}:`, e.message);
    return null;
  }
}

async function getFBFollowers(page, url) {
  if (!url) return null;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    const content = await page.content();
    
    // Look for followers in the whole HTML
    const patterns = [
      /([\d.,]+[KMT]?)\s*followers/i,
      /([\d.,]+[KMT]?)\s*người theo dõi/i,
      /"follower_count":(\d+)/i
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return parseCount(match[1]);
    }
    return null;
  } catch (e) {
    console.error(`Error scraping FB ${url}:`, e.message);
    return null;
  }
}

async function getTikTokFollowers(page, url) {
  if (!url) return null;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const content = await page.content();

    const patterns = [
      /([\d.,]+[KMT]?)\s*Followers/i,
      /"followerCount":(\d+)/i,
      /followerCount\\":(\d+)/i
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return parseCount(match[1]);
    }
    return null;
  } catch (e) {
    console.error(`Error scraping TikTok ${url}:`, e.message);
    return null;
  }
}

async function getYTSubscribers(page, url) {
  if (!url) return null;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    const content = await page.content();

    const patterns = [
      /([\d.,]+[KMT]?)\s*subscribers/i,
      /([\d.,]+[KMT]?)\s*người đăng ký/i,
      /"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([\d.,]+[KMT]?)\s*subscribers"/i
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return parseCount(match[1]);
    }
    return null;
  } catch (e) {
    console.error(`Error scraping YouTube ${url}:`, e.message);
    return null;
  }
}

async function updateData() {
  console.log('Starting resilient social crawler...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'vi-VN'
  });
  const page = await context.newPage();

  const firms = db.prepare('SELECT id, name, full_name, facebook_url, tiktok_url, youtube_url FROM firms').all();
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
    console.log(`Processing ${firm.name} (${firm.id})...`);
    
    // 1. Try direct scraping
    let fbCount = await getFBFollowers(page, firm.facebook_url);
    let ttCount = await getTikTokFollowers(page, firm.tiktok_url);
    let ytCount = await getYTSubscribers(page, firm.youtube_url);

    // 2. Fallback to Bing Search if direct scraping failed
    if (!fbCount) {
      console.log(`  Fallback searching FB for ${firm.name}...`);
      fbCount = await getStatsFromSearch(page, `site:facebook.com "${firm.name}" securities followers official`);
    }
    if (!ttCount) {
      console.log(`  Fallback searching TikTok for ${firm.name}...`);
      ttCount = await getStatsFromSearch(page, `site:tiktok.com "${firm.name}" securities followers official`);
    }
    if (!ytCount) {
      console.log(`  Fallback searching YouTube for ${firm.name}...`);
      ytCount = await getStatsFromSearch(page, `site:youtube.com "${firm.name}" securities subscribers official`);
    }

    console.log(`-> ${firm.id} RESULTS: FB: ${fbCount || 'N/A'}, TT: ${ttCount || 'N/A'}, YT: ${ytCount || 'N/A'}`);

    const lastData = db.prepare('SELECT * FROM social_metrics WHERE firm_id = ? ORDER BY date DESC LIMIT 1').get(firm.id);
    
    insertSocial.run(
      firm.id, 
      currentDate, 
      fbCount || lastData?.facebook_followers || 0, 
      ttCount || lastData?.tiktok_followers || 0, 
      ytCount || lastData?.youtube_subscribers || 0
    );
    
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();
  console.log('Social crawl complete.');
}

updateData().catch(console.error);
