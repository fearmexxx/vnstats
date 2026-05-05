'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function saveSocialMetrics(formData: FormData) {
  const date = formData.get('date') as string;
  const metricsData = formData.get('metrics') as string;
  
  if (!date || !metricsData) {
    return { error: 'Date and metrics data are required' };
  }

  const metrics = JSON.parse(metricsData);

  try {
    for (const [firmId, values] of Object.entries(metrics) as any) {
      await db.execute({
        sql: `
          INSERT INTO social_metrics (firm_id, date, facebook_followers, tiktok_followers, youtube_subscribers)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(firm_id, date) DO UPDATE SET
            facebook_followers = excluded.facebook_followers,
            tiktok_followers = excluded.tiktok_followers,
            youtube_subscribers = excluded.youtube_subscribers
        `,
        args: [
          firmId,
          date,
          parseInt(values.facebook) || 0,
          parseInt(values.tiktok) || 0,
          parseInt(values.youtube) || 0
        ]
      });
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('SERVER_ACTION_ERROR [saveSocialMetrics]:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return { error: `Server Error: ${error.message}` };
  }
}

export async function saveFirmChannels(formData: FormData) {
  const channelsData = formData.get('channels') as string;
  
  if (!channelsData) {
    return { error: 'Channels data is required' };
  }

  const channels = JSON.parse(channelsData);

  try {
    for (const [firmId, values] of Object.entries(channels) as any) {
      await db.execute({
        sql: `
          UPDATE firms 
          SET facebook_url = ?, tiktok_url = ?, youtube_url = ?
          WHERE id = ?
        `,
        args: [
          values.facebook_url || '',
          values.tiktok_url || '',
          values.youtube_url || '',
          firmId
        ]
      });
    }

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath(`/firm/[id]`, 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('SERVER_ACTION_ERROR [saveFirmChannels]:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return { error: `Server Error: ${error.message}` };
  }
}

export async function saveEarnings(formData: FormData) {
  const earningsData = formData.get('earnings') as string;
  const quarter = formData.get('quarter') as string;
  const year = parseInt(formData.get('year') as string);
  
  if (!earningsData || !quarter || !year) {
    return { error: 'Earnings data, quarter, and year are required' };
  }

  const earnings = JSON.parse(earningsData);

  try {
    for (const [firmId, amount] of Object.entries(earnings) as any) {
      await db.execute({
        sql: `
          INSERT INTO earnings (firm_id, quarter, year, amount)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(firm_id, quarter, year) DO UPDATE SET
            amount = excluded.amount
        `,
        args: [
          firmId,
          quarter,
          year,
          parseFloat(amount) || 0
        ]
      });
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('SERVER_ACTION_ERROR [saveEarnings]:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return { error: `Server Error: ${error.message}` };
  }
}
