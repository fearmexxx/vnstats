'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TOP_15_FIRMS, OTHERS_SHARE } from '@/lib/constants';
import marketAccounts from '@/data/market-accounts.json';
import socialMetrics from '@/data/social-metrics.json';
import newsData from '@/data/news.json';
import { Users, TrendingUp, Share2, Newspaper, Video, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', 
  '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57',
  '#a4c8e0', '#f47560', '#e8c1a0', '#f1e15b', '#e8a838'
];

export default function Dashboard() {
  const router = useRouter();
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  const latestAccounts = marketAccounts.latestNewAccounts;
  const lastUpdated = marketAccounts.lastUpdated;

  const pieData = [
    ...TOP_15_FIRMS.map(f => ({ name: f.name, value: f.marketShare })),
    { name: 'Others', value: OTHERS_SHARE }
  ];

  const tableData = TOP_15_FIRMS.map(firm => {
    const estNewAccounts = Math.round((latestAccounts * firm.marketShare) / 100);
    const social = (socialMetrics.firms as any)[firm.id] || { facebook: 0, tiktok: 0 };
    return {
      ...firm,
      estNewAccounts,
      facebook: social.facebook,
      tiktok: social.tiktok,
      youtube: Math.floor(social.facebook * 0.1), // Placeholder for YT
      totalSocial: social.facebook + social.tiktok + Math.floor(social.facebook * 0.1)
    };
  }).sort((a, b) => b.marketShare - a.marketShare);

  const growthData = marketAccounts.history.slice(-12).map(h => ({
    name: h.date.split('/').slice(1).join('/'),
    accounts: h.newAccounts
  }));

  const fetchAiInsight = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/insights');
      const data = await res.json();
      setAiInsight(data.insight);
    } catch (e) {
      setAiInsight("Failed to generate AI insights. Check API configuration.");
    }
    setLoadingAi(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">VNStats Market Center</h1>
            <p className="text-gray-500">Institutional Strategy Dashboard • Last updated: {lastUpdated}</p>
          </div>
          <button 
            onClick={fetchAiInsight}
            disabled={loadingAi}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            {loadingAi ? "Analyzing..." : "Predict Next Month"}
          </button>
        </div>

        {/* AI Insight Section */}
        {aiInsight && (
          <div className="bg-white border-2 border-indigo-100 p-8 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              AI Strategic Prediction & Trajectory
            </h3>
            <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed">
              {aiInsight.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Market New Accounts" value={latestAccounts.toLocaleString()} subValue="Last Month" icon={<Users className="w-6 h-6 text-blue-600" />} />
          <StatCard title="Top 15 Market Share" value="80.54%" subValue="Consolidated" icon={<TrendingUp className="w-6 h-6 text-green-600" />} />
          <StatCard title="Total Social Reach" value="3.1M+" subValue="Followers" icon={<Share2 className="w-6 h-6 text-purple-600" />} />
          <StatCard title="Economy Trend" value="Bullish" subValue="High Growth" icon={<Sparkles className="w-6 h-6 text-orange-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Share Chart */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Market Share Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-gray-400">
              {pieData.slice(0, 4).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span>{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Growth Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Market Trajectory (New Accounts)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="accounts" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Firm Digital Battle & Share</h3>
            <p className="text-xs text-gray-400 font-medium">Click on a firm to view detailed MoM growth</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-widest font-black">
                  <th className="px-6 py-4">Firm Entity</th>
                  <th className="px-6 py-4 text-right">Mkt Share</th>
                  <th className="px-6 py-4 text-right">Est. New Accounts</th>
                  <th className="px-6 py-4 text-right">Facebook</th>
                  <th className="px-6 py-4 text-right">TikTok</th>
                  <th className="px-6 py-4 text-right">YouTube</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tableData.map((firm) => (
                  <tr key={firm.id} className="group hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/firm/${firm.id}`)}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{firm.name}</div>
                      <div className="text-[10px] text-gray-400 font-medium uppercase">{firm.fullName}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold">{firm.marketShare}%</span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                      {firm.estNewAccounts.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {firm.facebook.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {firm.tiktok.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {firm.youtube.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, icon }: { title: string, value: string, subValue: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-black text-gray-900 tracking-tight">{value}</h4>
          <span className="text-xs text-green-500 font-bold">{subValue}</span>
        </div>
      </div>
    </div>
  );
}
