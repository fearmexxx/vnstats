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
    console.error('Failed to save metrics:', error);
    return { error: error.message };
  }
}
