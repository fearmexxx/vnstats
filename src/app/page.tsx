'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { TOP_15_FIRMS, OTHERS_SHARE } from '@/lib/constants';
import marketAccounts from '@/data/market-accounts.json';
import socialMetrics from '@/data/social-metrics.json';
import newsData from '@/data/news.json';
import { Users, TrendingUp, Share2, Newspaper } from 'lucide-react';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', 
  '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57',
  '#a4c8e0', '#f47560', '#e8c1a0', '#f1e15b', '#e8a838'
];

export default function Dashboard() {
  const latestAccounts = marketAccounts.latestNewAccounts;
  const lastUpdated = marketAccounts.lastUpdated;

  // Prepare data for Market Share Pie Chart
  const pieData = [
    ...TOP_15_FIRMS.map(f => ({ name: f.name, value: f.marketShare })),
    { name: 'Others', value: OTHERS_SHARE }
  ];

  // Prepare data for Table
  const tableData = TOP_15_FIRMS.map(firm => {
    const estNewAccounts = Math.round((latestAccounts * firm.marketShare) / 100);
    const social = (socialMetrics.firms as any)[firm.id] || { facebook: 0, tiktok: 0 };
    return {
      ...firm,
      estNewAccounts,
      facebook: social.facebook,
      tiktok: social.tiktok,
      totalSocial: social.facebook + social.tiktok
    };
  }).sort((a, b) => b.marketShare - a.marketShare);

  // Prepare data for Growth Chart (last 12 months)
  const growthData = marketAccounts.history.slice(-12).map(h => ({
    name: h.date.split('/').slice(1).join('/'),
    accounts: h.newAccounts
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">VNStats Intelligence</h1>
            <p className="text-gray-500">Securities Market Tracking Dashboard • Last updated: {lastUpdated}</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Q1 2026 Data</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Real-time Ingestion Active</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Market New Accounts" 
            value={latestAccounts.toLocaleString()} 
            subValue="Last Month"
            icon={<Users className="w-6 h-6 text-blue-600" />}
          />
          <StatCard 
            title="Top 15 Market Share" 
            value="80.54%" 
            subValue="Consolidated"
            icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          />
          <StatCard 
            title="Total Social Reach" 
            value="2.8M+" 
            subValue="Followers"
            icon={<Share2 className="w-6 h-6 text-purple-600" />}
          />
          <StatCard 
            title="Monitored Entities" 
            value="15" 
            subValue="Top Firms"
            icon={<Newspaper className="w-6 h-6 text-orange-600" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Share Chart */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Market Share Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {pieData.slice(0, 6).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-gray-600">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Growth Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Monthly Market Growth (New Accounts)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="accounts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Securities Firms Performance</h3>
            <button className="text-sm text-blue-600 font-medium">View Full Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Firm</th>
                  <th className="px-6 py-3 font-semibold text-right">Mkt Share</th>
                  <th className="px-6 py-3 font-semibold text-right">Est. New (Monthly)</th>
                  <th className="px-6 py-3 font-semibold text-right">FB Followers</th>
                  <th className="px-6 py-3 font-semibold text-right">TikTok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableData.map((firm) => (
                  <tr key={firm.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{firm.name}</div>
                      <div className="text-xs text-gray-500">{firm.fullName}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-blue-600">
                      {firm.marketShare}%
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      {firm.estNewAccounts.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      {firm.facebook.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">
                      {firm.tiktok.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* News Feed & Market Updates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-orange-500" />
              Latest News & SSC Updates
            </h3>
            <div className="space-y-4">
              {newsData.map((news) => (
                <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{news.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{news.source} • {new Date(news.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
              See all market news
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-xl shadow-lg text-white">
            <h3 className="text-xl font-bold mb-2">Strategic Insight</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              The market is currently seeing a consolidation of retail investors in the top 3 firms (VPS, SSI, TCBS). 
              VPS continues to dominate new account acquisition with an estimated {Math.round((latestAccounts * 15.32) / 100).toLocaleString()} new clients this month. 
              Social media engagement is highest for VPS and DNSE, indicating a strong capture of Gen Z and mobile-first investors.
            </p>
            <div className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-xs uppercase font-bold text-blue-200">Recommendation</div>
              <div className="text-sm mt-1">Focus on monitoring the "Zero Fee" firms as they gain market share from traditional players.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, icon }: { title: string, value: string, subValue: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
          <span className="text-xs text-gray-400 font-medium">{subValue}</span>
        </div>
      </div>
    </div>
  );
}
