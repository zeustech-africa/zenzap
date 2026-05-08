'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalMessages: 0,
    totalLeads: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    userGrowth: [],
    messageVolume: []
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center text-white">Loading analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition">← Dashboard</Link>
          <span className="text-white font-bold ml-4">System Analytics</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-3xl font-bold text-white">{analytics.totalUsers}</div>
            <div className="text-gray-400">Total Users</div>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">💬</div>
            <div className="text-3xl font-bold text-white">{analytics.totalMessages}</div>
            <div className="text-gray-400">Messages</div>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-white">{analytics.totalLeads}</div>
            <div className="text-gray-400">Leads</div>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">📅</div>
            <div className="text-3xl font-bold text-white">{analytics.totalBookings}</div>
            <div className="text-gray-400">Bookings</div>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-green-400">R{analytics.monthlyRevenue.toLocaleString()}</div>
            <div className="text-gray-400">Monthly Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
}