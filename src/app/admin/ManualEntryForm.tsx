'use client';

import React, { useState } from 'react';
import { saveSocialMetrics } from './actions';
import { Firm, SocialMetric } from '@/lib/db';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  firms: Firm[];
  latestMetrics: Record<string, SocialMetric>;
}

export default function ManualEntryForm({ firms, latestMetrics }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [metrics, setMetrics] = useState<Record<string, { facebook: string, tiktok: string, youtube: string }>>(
    firms.reduce((acc, firm) => {
      const m = latestMetrics[firm.id];
      acc[firm.id] = {
        facebook: m?.facebook_followers?.toString() || '',
        tiktok: m?.tiktok_followers?.toString() || '',
        youtube: m?.youtube_subscribers?.toString() || ''
      };
      return acc;
    }, {} as any)
  );
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (firmId: string, platform: 'facebook' | 'tiktok' | 'youtube', value: string) => {
    setMetrics(prev => ({
      ...prev,
      [firmId]: {
        ...prev[firmId],
        [platform]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('date', date);
    formData.append('metrics', JSON.stringify(metrics));

    const result = await saveSocialMetrics(formData);
    
    if (result.success) {
      setStatus({ type: 'success', message: 'Data saved successfully!' });
    } else {
      setStatus({ type: 'error', message: result.error || 'Failed to save data' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none">Reporting Date (End of Week/Month)</label>
          <input 
            id="date"
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full md:w-48 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            required
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save All Metrics</>}
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-bold">{status.message}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Firm</th>
                <th className="px-6 py-4">Facebook Followers</th>
                <th className="px-6 py-4">TikTok Followers</th>
                <th className="px-6 py-4">YouTube Subscribers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {firms.map((firm) => (
                <tr key={firm.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{firm.name}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase">{firm.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      value={metrics[firm.id]?.facebook}
                      onChange={(e) => handleInputChange(firm.id, 'facebook', e.target.value)}
                      placeholder="e.g. 452000"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      value={metrics[firm.id]?.tiktok}
                      onChange={(e) => handleInputChange(firm.id, 'tiktok', e.target.value)}
                      placeholder="e.g. 120000"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number"
                      value={metrics[firm.id]?.youtube}
                      onChange={(e) => handleInputChange(firm.id, 'youtube', e.target.value)}
                      placeholder="e.g. 45000"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
}
