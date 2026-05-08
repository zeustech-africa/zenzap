'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  messages: {
    totalIncoming: number;
    totalOutgoing: number;
    byDay: { date: string; incoming: number; outgoing: number }[];
    byHour: { hour: number; count: number }[];
  };
  responseTimes: {
    averageFirstResponseMinutes: number;
    fastestResponseMinutes: number;
    slowestResponseMinutes: number;
  };
  funnel: {
    stages: { name: string; count: number; conversionRate: number }[];
  };
  revenue: {
    totalRevenue: number;
    mrr: number;
    byMonth: { month: string; amount: number }[];
    byPlan: { plan: string; amount: number; count: number }[];
  };
  bookings: {
    totalBookings: number;
    completedBookings: number;
    completionRate: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/dashboard?days=${days}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Analytics Dashboard</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Date Range Selector */}
        <div className="flex justify-end mb-6">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Message Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">💬</div>
            <div className="text-2xl font-bold text-white">{data?.messages.totalIncoming.toLocaleString()}</div>
            <div className="text-gray-400">Messages Received</div>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">📤</div>
            <div className="text-2xl font-bold text-white">{data?.messages.totalOutgoing.toLocaleString()}</div>
            <div className="text-gray-400">Messages Sent</div>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-white">{data?.responseTimes.averageFirstResponseMinutes.toFixed(1)} min</div>
            <div className="text-gray-400">Avg Response Time</div>
          </div>
        </div>

        {/* Response Time Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-green-400 text-sm">Fastest</div>
            <div className="text-xl font-bold text-white">{data?.responseTimes.fastestResponseMinutes.toFixed(1)} min</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-yellow-400 text-sm">Average</div>
            <div className="text-xl font-bold text-white">{data?.responseTimes.averageFirstResponseMinutes.toFixed(1)} min</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-red-400 text-sm">Slowest</div>
            <div className="text-xl font-bold text-white">{data?.responseTimes.slowestResponseMinutes.toFixed(1)} min</div>
          </div>
        </div>

        {/* Message Volume Chart (Simplified - bar chart representation) */}
        <div className="bg-white/10 rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-white font-bold mb-4">📊 Message Volume (Last {days} Days)</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data?.messages.byDay.slice(-14).map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <div className="w-24 text-gray-400 text-sm">{day.date}</div>
                <div className="flex-1">
                  <div className="flex gap-1">
                    <div 
                      className="bg-blue-500 rounded h-6"
                      style={{ width: `${Math.min(100, (day.incoming / Math.max(...data.messages.byDay.map(d => d.incoming), 1)) * 100)}%` }}
                      title={`Incoming: ${day.incoming}`}
                    ></div>
                    <div 
                      className="bg-orange-500 rounded h-6"
                      style={{ width: `${Math.min(100, (day.outgoing / Math.max(...data.messages.byDay.map(d => d.outgoing), 1)) * 100)}%` }}
                      title={`Outgoing: ${day.outgoing}`}
                    ></div>
                  </div>
                </div>
                <div className="text-gray-400 text-xs w-16 text-right">
                  {day.incoming} / {day.outgoing}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div><span className="text-gray-400 text-xs">Incoming</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded"></div><span className="text-gray-400 text-xs">Outgoing</span></div>
          </div>
        </div>

        {/* Lead Conversion Funnel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-white font-bold mb-4">🎯 Lead Conversion Funnel</h2>
            <div className="space-y-4">
              {data?.funnel.stages.map((stage, idx) => (
                <div key={stage.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{stage.name}</span>
                    <span className="text-gray-400">{stage.count} leads</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 rounded-full h-2" style={{ width: `${stage.conversionRate}%` }}></div>
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">{stage.conversionRate.toFixed(1)}% conversion</div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Stats */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-white font-bold mb-4">💰 Revenue Analytics</h2>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-green-400">R{data?.revenue.totalRevenue.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Total Revenue (All Time)</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white">R{data?.revenue.mrr.toLocaleString()}</div>
                <div className="text-gray-400 text-xs">Monthly Recurring Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{data?.bookings.totalBookings}</div>
                <div className="text-gray-400 text-xs">Total Bookings</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-gray-400 text-sm mb-2">Revenue by Plan</div>
              {data?.revenue.byPlan.map((plan) => (
                <div key={plan.plan} className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{plan.plan}</span>
                  <span className="text-white">R{plan.amount.toLocaleString()} ({plan.count} subscribers)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Stats */}
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <h2 className="text-white font-bold mb-4">📅 Appointment Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{data?.bookings.totalBookings}</div>
              <div className="text-gray-400 text-sm">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{data?.bookings.completedBookings}</div>
              <div className="text-gray-400 text-sm">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{data?.bookings.completionRate.toFixed(1)}%</div>
              <div className="text-gray-400 text-sm">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}