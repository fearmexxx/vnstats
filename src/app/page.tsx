import { getFirms, getSocialMetricsWithGrowth, getMarketAccounts, getLatestEarnings } from '@/lib/db';
import DashboardClient from '@/components/DashboardClient';

export default async function Dashboard() {
  const firms = await getFirms();
  const socialMetrics = await getSocialMetricsWithGrowth();
  const marketAccounts = await getMarketAccounts();
  const latestEarnings = await getLatestEarnings();

  return (
    <DashboardClient 
      firms={firms} 
      socialMetrics={socialMetrics} 
      marketAccounts={marketAccounts} 
      latestEarnings={latestEarnings}
    />
  );
}
