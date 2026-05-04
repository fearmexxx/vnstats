import { getFirmById, getFirmHistoricalMetrics } from '@/lib/db';
import FirmDetailClient from '@/components/FirmDetailClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FirmPage({ params }: Props) {
  const { id } = await params;
  const firm = await getFirmById(id);
  
  if (!firm) {
    notFound();
  }

  const historicalData = await getFirmHistoricalMetrics(id);

  return (
    <FirmDetailClient 
      firm={firm} 
      historicalData={historicalData} 
    />
  );
}
