import { getFirms, getLatestSocialMetrics, getLatestEarnings } from '@/lib/db';
import ManualEntryForm from './ManualEntryForm';

export default async function AdminPage() {
  const firms = await getFirms();
  const latestMetrics = await getLatestSocialMetrics();
  const latestEarnings = await getLatestEarnings();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Data Command Center</h1>
          <p className="text-gray-500 font-medium">Manually update social media metrics and financial results.</p>
        </div>

        <ManualEntryForm 
          firms={firms} 
          latestMetrics={latestMetrics} 
          latestEarnings={latestEarnings}
        />
      </div>
    </div>
  );
}
