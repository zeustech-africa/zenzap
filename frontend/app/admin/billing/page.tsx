'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BillingStats {
  totalUsers: number;
  freeUsers: number;
  starterUsers: number;
  proUsers: number;
  businessUsers: number;
  paidUsers: number;
  monthlyRevenue: number;
}

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BillingStats>({
    totalUsers: 0,
    freeUsers: 0,
    starterUsers: 0,
    proUsers: 0,
    businessUsers: 0,
    paidUsers: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-gray-400">Loading billing data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Billing Management</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalUsers}</div>
            <div className="text-gray-400">Total Users</div>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">R{stats.monthlyRevenue.toLocaleString()}</div>
            <div className="text-gray-400">Monthly Revenue</div>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.paidUsers || 0}</div>
            <div className="text-gray-400">Paid Subscribers</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <h2 className="text-white font-bold mb-4">Subscription Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">Free Plan</span>
              <span className="text-white font-medium">{stats.freeUsers || 0} users</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">Starter (R299/mo)</span>
              <span className="text-white font-medium">{stats.starterUsers || 0} users</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">Pro (R599/mo)</span>
              <span className="text-white font-medium">{stats.proUsers || 0} users</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">Business (R999/mo)</span>
              <span className="text-white font-medium">{stats.businessUsers || 0} users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}