'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Video, Share2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  firm: any;
  historicalData: any[];
}

export default function FirmDetailClient({ firm, historicalData }: Props) {
  const router = useRouter();

  if (!firm) return <div>Firm not found</div>;

  const current = historicalData[historicalData.length - 1];
  const previous = historicalData[historicalData.length - 2];

  const getGrowth = (curr: number, prev: number) => {
    if (!curr || !prev) return 0;
    return (((curr - prev) / prev) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{firm.name}</h1>
              <p className="text-xl text-gray-500 mt-2 font-medium">{firm.full_name}</p>
              <div className="flex gap-4 mt-6">
                <SocialLink href={firm.facebook_url} icon={<MessageCircle className="w-5 h-5" />} label="Facebook" color="bg-blue-600" />
                <SocialLink href={firm.tiktok_url} icon={<Share2 className="w-5 h-5" />} label="TikTok" color="bg-black" />
                <SocialLink href={firm.youtube_url} icon={<Video className="w-5 h-5" />} label="YouTube" color="bg-red-600" />
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center min-w-[200px]">
              <div className="text-blue-600 text-[10px] uppercase font-black tracking-widest leading-none">Market Share</div>
              <div className="text-5xl font-black text-blue-700 mt-2 tracking-tighter">{firm.market_share}%</div>
              <div className="text-blue-500 text-xs mt-2 font-bold italic">Q1 2026 HOSE Official</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            title="Facebook Followers" 
            value={current?.fb.toLocaleString()} 
            growth={getGrowth(current?.fb, previous?.fb)} 
            icon={<MessageCircle className="w-6 h-6 text-blue-600" />}
          />
          <MetricCard 
            title="TikTok Followers" 
            value={current?.tt.toLocaleString()} 
            growth={getGrowth(current?.tt, previous?.tt)} 
            icon={<Share2 className="w-6 h-6 text-gray-900" />}
          />
          <MetricCard 
            title="YouTube Subscribers" 
            value={current?.yt.toLocaleString()} 
            growth={getGrowth(current?.yt, previous?.yt)} 
            icon={<Video className="w-6 h-6 text-red-600" />}
          />
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800">Omni-channel Growth Trend (Manual Data)</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="fb" name="Facebook" stroke="#2563eb" strokeWidth={3} dot={{ r: 6 }} />
                <Line type="monotone" dataKey="tt" name="TikTok" stroke="#000000" strokeWidth={3} dot={{ r: 6 }} />
                <Line type="monotone" dataKey="yt" name="YouTube" stroke="#dc2626" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialLink({ href, icon, label, color }: { href: string, icon: React.ReactNode, label: string, color: string }) {
  if (!href) return null;
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-4 py-2 ${color} text-white rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-sm`}
    >
      {icon} {label}
    </a>
  );
}

function MetricCard({ title, value, growth, icon }: { title: string, value: string, growth: string | number, icon: React.ReactNode }) {
  const isPositive = Number(growth) > 0;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-xl">{icon}</div>
        <div className={`flex items-center gap-1 text-sm font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`w-4 h-4 ${!isPositive && 'rotate-180'}`} />
          {isPositive ? '+' : ''}{growth}%
        </div>
      </div>
      <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1">{title}</p>
      <h4 className="text-2xl font-black text-gray-900 tracking-tight mt-1">{value || '---'}</h4>
      <p className="text-xs text-gray-400 mt-2 font-medium italic leading-none">Compared to last period</p>
    </div>
  );
}
