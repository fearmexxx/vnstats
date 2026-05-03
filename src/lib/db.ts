import { createClient } from '@libsql/client';

export const db = createClient({
  url: 'file:data.db',
});

export interface Firm {
  id: string;
  name: string;
  full_name: string;
  facebook_url: string;
  tiktok_url: string;
  youtube_url: string;
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

export interface MarketShare {
  firm_id: string;
  quarter: string;
  year: number;
  percentage: number;
}
