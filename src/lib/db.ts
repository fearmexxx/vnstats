import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:data.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export interface Firm {
  id: string;
  name: string;
  full_name: string;
  facebook_url: string;
  tiktok_url: string;
  youtube_url: string;
  market_share?: number;
}

export interface SocialMetric {
  firm_id: string;
  date: string;
  facebook_followers: number;
  tiktok_followers: number;
  youtube_subscribers: number;
}

export interface MarketAccount {
  date: string;
  total_accounts: number;
  new_accounts: number;
}

export async function getFirms(): Promise<Firm[]> {
  const result = await db.execute(`
    SELECT f.*, ms.percentage as market_share 
    FROM firms f 
    LEFT JOIN market_shares ms ON f.id = ms.firm_id AND ms.quarter = 'Q1' AND ms.year = 2026
    ORDER BY ms.percentage DESC
  `);
  return result.rows.map(row => ({
    id: row.id as string,
    name: row.name as string,
    full_name: row.full_name as string,
    facebook_url: row.facebook_url as string,
    tiktok_url: row.tiktok_url as string,
    youtube_url: row.youtube_url as string,
    market_share: row.market_share as number,
  }));
}

export async function getLatestSocialMetrics(): Promise<Record<string, SocialMetric>> {
  const result = await db.execute(`
    WITH LatestDates AS (
      SELECT firm_id, MAX(date) as max_date
      FROM social_metrics
      GROUP BY firm_id
    )
    SELECT sm.*
    FROM social_metrics sm
    JOIN LatestDates ld ON sm.firm_id = ld.firm_id AND sm.date = ld.max_date
  `);
  
  const metrics: Record<string, SocialMetric> = {};
  result.rows.forEach(row => {
    metrics[row.firm_id as string] = {
      firm_id: row.firm_id as string,
      date: row.date as string,
      facebook_followers: row.facebook_followers as number,
      tiktok_followers: row.tiktok_followers as number,
      youtube_subscribers: row.youtube_subscribers as number,
    };
  });
  return metrics;
}

export async function getMarketAccounts(): Promise<MarketAccount[]> {
  const result = await db.execute('SELECT * FROM market_accounts');
  
  // Custom sort because SQLite doesn't understand DD/MM/YYYY for ordering
  return result.rows.map(row => ({
    date: row.date as string,
    total_accounts: row.total_accounts as number,
    new_accounts: row.new_accounts as number,
  })).sort((a, b) => {
    const [d1, m1, y1] = a.date.split('/').map(Number);
    const [d2, m2, y2] = b.date.split('/').map(Number);
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    return date2.getTime() - date1.getTime();
  });
}

export async function getFirmHistoricalMetrics(firmId: string): Promise<any[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM social_metrics WHERE firm_id = ? ORDER BY date ASC',
    args: [firmId]
  });
  return result.rows.map(row => ({
    date: row.date as string,
    fb: row.facebook_followers as number,
    tt: row.tiktok_followers as number,
    yt: row.youtube_subscribers as number,
  }));
}

export async function getFirmById(id: string): Promise<Firm | null> {
  const result = await db.execute({
    sql: `
      SELECT f.*, ms.percentage as market_share 
      FROM firms f 
      LEFT JOIN market_shares ms ON f.id = ms.firm_id AND ms.quarter = 'Q1' AND ms.year = 2026
      WHERE f.id = ?
    `,
    args: [id]
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id as string,
    name: row.name as string,
    full_name: row.full_name as string,
    facebook_url: row.facebook_url as string,
    tiktok_url: row.tiktok_url as string,
    youtube_url: row.youtube_url as string,
    market_share: row.market_share as number,
  };
}

export async function getSocialMetricsWithGrowth(): Promise<any[]> {
  const result = await db.execute(`
    WITH RankedMetrics AS (
      SELECT 
        sm.*,
        LAG(facebook_followers) OVER (PARTITION BY firm_id ORDER BY date) as prev_fb,
        LAG(tiktok_followers) OVER (PARTITION BY firm_id ORDER BY date) as prev_tt,
        LAG(youtube_subscribers) OVER (PARTITION BY firm_id ORDER BY date) as prev_yt,
        ROW_NUMBER() OVER (PARTITION BY firm_id ORDER BY date DESC) as rn
      FROM social_metrics sm
    )
    SELECT 
      f.name, f.full_name, rm.*
    FROM RankedMetrics rm
    JOIN firms f ON rm.firm_id = f.id
    WHERE rm.rn = 1
  `);
  
  return result.rows.map(row => ({
    id: row.firm_id,
    name: row.name,
    fullName: row.full_name,
    date: row.date,
    facebook: row.facebook_followers,
    tiktok: row.tiktok_followers,
    youtube: row.youtube_subscribers,
    prevFb: row.prev_fb,
    prevTt: row.prev_tt,
    prevYt: row.prev_yt,
    fbGrowth: row.prev_fb ? (((row.facebook_followers as number - (row.prev_fb as number)) / (row.prev_fb as number)) * 100).toFixed(1) : '0',
    ttGrowth: row.prev_tt ? (((row.tiktok_followers as number - (row.prev_tt as number)) / (row.prev_tt as number)) * 100).toFixed(1) : '0',
    ytGrowth: row.prev_yt ? (((row.youtube_subscribers as number - (row.prev_yt as number)) / (row.prev_yt as number)) * 100).toFixed(1) : '0'
  }));
}
