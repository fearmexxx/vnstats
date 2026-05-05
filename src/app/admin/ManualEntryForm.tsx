'use client';

import React, { useState } from 'react';
import { saveSocialMetrics, saveFirmChannels, saveEarnings } from './actions';
import { Firm, SocialMetric } from '@/lib/db';
import { Save, AlertCircle, CheckCircle2, Globe, TrendingUp, DollarSign } from 'lucide-react';

interface Props {
  firms: Firm[];
  latestMetrics: Record<string, SocialMetric>;
  latestEarnings: Record<string, number>;
}

export default function ManualEntryForm({ firms, latestMetrics, latestEarnings }: Props) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'channels' | 'earnings'>('metrics');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quarter, setQuarter] = useState('Q1');
  const [year, setYear] = useState('2026');
  
  // Metrics State
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

  // Channels State
  const [channels, setChannels] = useState<Record<string, { facebook_url: string, tiktok_url: string, youtube_url: string }>>(
    firms.reduce((acc, firm) => {
      acc[firm.id] = {
        facebook_url: firm.facebook_url || '',
        tiktok_url: firm.tiktok_url || '',
        youtube_url: firm.youtube_url || ''
      };
      return acc;
    }, {} as any)
  );

  // Earnings State
  const [earnings, setEarnings] = useState<Record<string, string>>(
    firms.reduce((acc, firm) => {
      acc[firm.id] = latestEarnings[firm.id]?.toString() || '';
      return acc;
    }, {} as any)
  );

  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMetricChange = (firmId: string, platform: 'facebook' | 'tiktok' | 'youtube', value: string) => {
    setMetrics(prev => ({
      ...prev,
      [firmId]: {
        ...prev[firmId],
        [platform]: value
      }
    }));
  };

  const handleChannelChange = (firmId: string, platform: 'facebook_url' | 'tiktok_url' | 'youtube_url', value: string) => {
    setChannels(prev => ({
      ...prev,
      [firmId]: {
        ...prev[firmId],
        [platform]: value
      }
    }));
  };

  const handleEarningChange = (firmId: string, value: string) => {
    setEarnings(prev => ({
      ...prev,
      [firmId]: value
    }));
  };

  const handleMetricsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('date', date);
    formData.append('metrics', JSON.stringify(metrics));

    const result = await saveSocialMetrics(formData);
    
    if (result.success) {
      setStatus({ type: 'success', message: 'Metrics saved successfully!' });
    } else {
      setStatus({ type: 'error', message: result.error || 'Failed to save metrics' });
    }
    setLoading(false);
  };

  const handleChannelsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('channels', JSON.stringify(channels));

    const result = await saveFirmChannels(formData);
    
    if (result.success) {
      setStatus({ type: 'success', message: 'Channel URLs updated successfully!' });
    } else {
      setStatus({ type: 'error', message: result.error || 'Failed to update channels' });
    }
    setLoading(false);
  };

  const handleEarningsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('earnings', JSON.stringify(earnings));
    formData.append('quarter', quarter);
    formData.append('year', year);

    const result = await saveEarnings(formData);
    
    if (result.success) {
      setStatus({ type: 'success', message: 'Earnings saved successfully!' });
    } else {
      setStatus({ type: 'error', message: result.error || 'Failed to save earnings' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'metrics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <TrendingUp className="w-4 h-4" />
          Update Metrics
        </button>
        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'earnings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <DollarSign className="w-4 h-4" />
          Update Earnings
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'channels' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Globe className="w-4 h-4" />
          Update Channels
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="font-bold">{status.message}</p>
        </div>
      )}

      {activeTab === 'metrics' && (
        <form onSubmit={handleMetricsSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="date" className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none">Reporting Date</label>
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
                          onChange={(e) => handleMetricChange(firm.id, 'facebook', e.target.value)}
                          placeholder="e.g. 452000"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number"
                          value={metrics[firm.id]?.tiktok}
                          onChange={(e) => handleMetricChange(firm.id, 'tiktok', e.target.value)}
                          placeholder="e.g. 120000"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="number"
                          value={metrics[firm.id]?.youtube}
                          onChange={(e) => handleMetricChange(firm.id, 'youtube', e.target.value)}
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
      )}

      {activeTab === 'earnings' && (
        <form onSubmit={handleEarningsSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="quarter" className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none">Quarter</label>
                <select 
                  id="quarter"
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  className="mt-1 block w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="year" className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none">Year</label>
                <input 
                  id="year"
                  type="number" 
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="mt-1 block w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save All Earnings</>}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                    <th className="px-6 py-4">Firm</th>
                    <th className="px-6 py-4 text-right">Profit Before Tax (Billion VND)</th>
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
                          step="0.01"
                          value={earnings[firm.id]}
                          onChange={(e) => handleEarningChange(firm.id, e.target.value)}
                          placeholder="e.g. 1547.5"
                          className="w-full max-w-[200px] ml-auto block px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-right focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'channels' && (
        <form onSubmit={handleChannelsSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Firm Social Channels</h3>
              <p className="text-sm text-gray-500">Update official URLs for each platform.</p>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Update All Channels</>}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                    <th className="px-6 py-4">Firm</th>
                    <th className="px-6 py-4">Facebook URL</th>
                    <th className="px-6 py-4">TikTok URL</th>
                    <th className="px-6 py-4">YouTube URL</th>
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
                          type="url"
                          value={channels[firm.id]?.facebook_url}
                          onChange={(e) => handleChannelChange(firm.id, 'facebook_url', e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="url"
                          value={channels[firm.id]?.tiktok_url}
                          onChange={(e) => handleChannelChange(firm.id, 'tiktok_url', e.target.value)}
                          placeholder="https://tiktok.com/@..."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="url"
                          value={channels[firm.id]?.youtube_url}
                          onChange={(e) => handleChannelChange(firm.id, 'youtube_url', e.target.value)}
                          placeholder="https://youtube.com/@..."
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
      )}
    </div>
  );
}
