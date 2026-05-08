'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  subscription: 'free' | 'starter' | 'pro' | 'business';
  subscriptionEndDate?: string;
  registeredAt: string;
  lastActive?: string;
  idDocumentUrl?: string;
  facePhotoUrl?: string;
}

interface SystemHealth {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  whatsapp: 'healthy' | 'degraded' | 'down';
  stripe: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    freeUsers: 0,
    paidUsers: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'pending' | 'subscriptions' | 'health'>('overview');
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState<any[]>([]);
  const [showMRRModal, setShowMRRModal] = useState(false);
  const [mrrDetails, setMRRDetails] = useState<{ total: number; breakdown: any[] } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchData();
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, pendingRes, statsRes, healthRes, alertsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/pending-users'),
        fetch('/api/admin/stats'),
        fetch('/api/admin/health'),
        fetch('/api/admin/alerts')
      ]);

      const usersData = await usersRes.json();
      const pendingData = await pendingRes.json();
      const statsData = await statsRes.json();
      const healthData = await healthRes.json();
      const alertsData = await alertsRes.json();

      setUsers(usersData);
      setPendingUsers(pendingData);
      setStats(statsData);
      setSystemHealth(healthData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/admin/health');
      const data = await response.json();
      setSystemHealth(data);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      await fetch(`/api/admin/approve/${userId}`, { method: 'POST' });
      await fetchData();
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      await fetch(`/api/admin/reject/${userId}`, { method: 'POST' });
      await fetchData();
    } catch (error) {
      console.error('Failed to reject user:', error);
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      await fetch(`/api/admin/suspend/${userId}`, { method: 'POST' });
      await fetchData();
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  const changeSubscription = async (userId: string, plan: string) => {
    try {
      await fetch(`/api/admin/update-subscription/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Approved</span>;
      case 'pending': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Pending</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Rejected</span>;
      case 'suspended': return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">Suspended</span>;
      default: return null;
    }
  };

  const getSubscriptionBadge = (plan: string) => {
    switch (plan) {
      case 'free': return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">Free</span>;
      case 'starter': return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Starter</span>;
      case 'pro': return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">Pro</span>;
      case 'business': return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">Business</span>;
      default: return null;
    }
  };

  const fetchFilteredUsers = async (filterType: string) => {
    try {
      const response = await fetch(`/api/admin/users?filter=${filterType}`);
      const data = await response.json();
      setModalUsers(data);
      setModalTitle(getFilterTitle(filterType));
      setShowUserModal(true);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const getFilterTitle = (filter: string) => {
    switch(filter) {
      case 'total': return 'All Users';
      case 'pending': return 'Pending Approvals';
      case 'active': return 'Active Users';
      case 'free': return 'Free Plan Users';
      case 'paid': return 'Paid Subscribers';
      default: return 'Users';
    }
  };

  const fetchMRRDetails = async () => {
    try {
      const response = await fetch('/api/admin/mrr-details');
      const data = await response.json();
      setMRRDetails(data);
      setShowMRRModal(true);
    } catch (error) {
      console.error('Failed to fetch MRR details:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading Admin Control Room...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/images/zenzap-logo-icon.png" alt="ZENZAP" className="h-8 w-8" />
            <span className="text-white font-bold">Admin Control Room</span>
            <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${systemHealth?.api === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-400 text-sm">System: {systemHealth?.api === 'healthy' ? 'Operational' : 'Degraded'}</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
              }}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards - Clickable Drill-down */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div onClick={() => fetchFilteredUsers('total')} className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition">
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            <div className="text-gray-400 text-sm">Total Users</div>
          </div>
          <div onClick={() => fetchFilteredUsers('pending')} className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition">
            <div className="text-2xl font-bold text-yellow-400">{stats.pendingApprovals}</div>
            <div className="text-gray-400 text-sm">Pending</div>
          </div>
          <div onClick={() => fetchFilteredUsers('active')} className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition">
            <div className="text-2xl font-bold text-green-400">{stats.activeUsers}</div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          <div onClick={() => fetchFilteredUsers('free')} className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition">
            <div className="text-2xl font-bold text-blue-400">{stats.freeUsers}</div>
            <div className="text-gray-400 text-sm">Free Plan</div>
          </div>
          <div onClick={() => fetchFilteredUsers('paid')} className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition">
            <div className="text-2xl font-bold text-orange-400">{stats.paidUsers}</div>
            <div className="text-gray-400 text-sm">Paid</div>
          </div>
          <div onClick={() => fetchMRRDetails()} className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition">
            <div className="text-2xl font-bold text-emerald-400">R{stats.monthlyRevenue.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">MRR</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
          {['overview', 'users', 'pending', 'subscriptions', 'health'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === tab
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h2 className="text-white font-bold mb-4">🖥️ System Health</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">API Server</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getHealthColor(systemHealth?.api || 'degraded')}`}></div>
                    <span className="text-white text-sm">{systemHealth?.api || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Database</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getHealthColor(systemHealth?.database || 'degraded')}`}></div>
                    <span className="text-white text-sm">{systemHealth?.database || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">WhatsApp API</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getHealthColor(systemHealth?.whatsapp || 'degraded')}`}></div>
                    <span className="text-white text-sm">{systemHealth?.whatsapp || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Stripe</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getHealthColor(systemHealth?.stripe || 'degraded')}`}></div>
                    <span className="text-white text-sm">{systemHealth?.stripe || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h2 className="text-white font-bold mb-4">⚠️ System Alerts</h2>
              {alerts.filter(a => !a.resolved).length === 0 ? (
                <p className="text-gray-400">No active alerts. System is healthy.</p>
              ) : (
                <div className="space-y-2">
                  {alerts.filter(a => !a.resolved).map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg ${
                      alert.type === 'error' ? 'bg-red-500/20 border border-red-500' :
                      alert.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500' :
                      'bg-blue-500/20 border border-blue-500'
                    }`}>
                      <div className="flex justify-between">
                        <span className="text-white text-sm">{alert.message}</span>
                        <span className="text-gray-400 text-xs">{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/admin/chat" className="bg-orange-500/20 hover:bg-orange-500/30 rounded-xl p-4 text-center border border-orange-500/30 transition">
                <div className="text-2xl mb-2">💬</div>
                <div className="text-white font-semibold">Support Chat</div>
                <div className="text-gray-400 text-sm">Manage tickets</div>
              </Link>
              <Link href="/admin/analytics" className="bg-orange-500/20 hover:bg-orange-500/30 rounded-xl p-4 text-center border border-orange-500/30 transition">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-white font-semibold">Analytics</div>
                <div className="text-gray-400 text-sm">System insights</div>
              </Link>
              <Link href="/admin/settings" className="bg-orange-500/20 hover:bg-orange-500/30 rounded-xl p-4 text-center border border-orange-500/30 transition">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-white font-semibold">Settings</div>
                <div className="text-gray-400 text-sm">Configure system</div>
              </Link>
              <Link href="/admin/broadcast" className="bg-orange-500/20 hover:bg-orange-500/30 rounded-xl p-4 text-center border border-orange-500/30 transition">
                <div className="text-2xl mb-2">📧</div>
                <div className="text-white font-semibold">Broadcast</div>
                <div className="text-gray-400 text-sm">Email all users</div>
              </Link>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-gray-300">Business</th>
                    <th className="text-left p-4 text-gray-300">Owner</th>
                    <th className="text-left p-4 text-gray-300">Email</th>
                    <th className="text-left p-4 text-gray-300">Phone</th>
                    <th className="text-left p-4 text-gray-300">Plan</th>
                    <th className="text-left p-4 text-gray-300">Status</th>
                    <th className="text-left p-4 text-gray-300">Registered</th>
                    <th className="text-left p-4 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="p-4 text-white">{user.businessName}</td>
                      <td className="p-4 text-gray-300">{user.ownerName}</td>
                      <td className="p-4 text-gray-300">{user.email}</td>
                      <td className="p-4 text-gray-300">{user.phone}</td>
                      <td className="p-4">{getSubscriptionBadge(user.subscription)}</td>
                      <td className="p-4">{getStatusBadge(user.status)}</td>
                      <td className="p-4 text-gray-400 text-sm">{new Date(user.registeredAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDocumentModal(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                            title="View ID"
                          >
                            🆔
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowFaceModal(true);
                            }}
                            className="text-green-400 hover:text-green-300 text-sm"
                            title="View Face"
                          >
                            👤
                          </button>
                          <button
                            onClick={() => router.push(`/admin/chat?userId=${user.id}&name=${encodeURIComponent(user.businessName)}`)}
                            className="text-orange-400 hover:text-orange-300 text-sm"
                            title="Chat with user"
                          >
                            💬
                          </button>
                          {user.status === 'approved' && (
                            <button
                              onClick={() => suspendUser(user.id)}
                              className="text-yellow-400 hover:text-yellow-300 text-sm"
                              title="Suspend"
                            >
                              ⏸️
                            </button>
                          )}
                          <select
                            onChange={(e) => changeSubscription(user.id, e.target.value)}
                            value={user.subscription}
                            className="bg-white/10 border border-white/20 rounded text-xs text-white px-1 py-0.5"
                          >
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="pro">Pro</option>
                            <option value="business">Business</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-gray-300">Business</th>
                    <th className="text-left p-4 text-gray-300">Owner</th>
                    <th className="text-left p-4 text-gray-300">Email</th>
                    <th className="text-left p-4 text-gray-300">WhatsApp</th>
                    <th className="text-left p-4 text-gray-300">Date</th>
                    <th className="text-left p-4 text-gray-300">Documents</th>
                    <th className="text-left p-4 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr key={user.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="p-4 text-white">{user.businessName}</td>
                      <td className="p-4 text-gray-300">{user.ownerName}</td>
                      <td className="p-4 text-gray-300">{user.email}</td>
                      <td className="p-4 text-gray-300">{user.phone}</td>
                      <td className="p-4 text-gray-400 text-sm">{new Date(user.registeredAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDocumentModal(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                            disabled={!user.idDocumentUrl}
                            title={user.idDocumentUrl ? "View ID document" : "No ID uploaded yet"}
                          >
                            🆔 View ID
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowFaceModal(true);
                            }}
                            className="text-green-400 hover:text-green-300 text-sm"
                            disabled={!user.facePhotoUrl}
                            title={user.facePhotoUrl ? "View face capture" : "No face capture uploaded yet"}
                          >
                            👤 View Face
                          </button>
                          <button
                            onClick={() => router.push(`/admin/chat?userId=${user.id}&name=${encodeURIComponent(user.businessName)}`)}
                            className="text-orange-400 hover:text-orange-300 text-sm"
                            title="Chat with user"
                          >
                            💬 Chat
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveUser(user.id)}
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded text-sm transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectUser(user.id)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded text-sm transition"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No pending approvals
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { plan: 'Free', count: stats.freeUsers, price: 0, color: 'gray' },
              { plan: 'Starter', count: users.filter(u => u.subscription === 'starter').length, price: 299, color: 'blue' },
              { plan: 'Pro', count: users.filter(u => u.subscription === 'pro').length, price: 599, color: 'purple' },
              { plan: 'Business', count: users.filter(u => u.subscription === 'business').length, price: 999, color: 'orange' }
            ].map((plan) => (
              <div key={plan.plan} className="bg-white/10 rounded-xl p-6 text-center border border-white/20">
                <div className={`text-${plan.color}-400 text-xl font-bold`}>{plan.plan}</div>
                <div className="text-3xl font-bold text-white mt-2">{plan.count}</div>
                <div className="text-gray-400 text-sm">Subscribers</div>
                <div className="text-emerald-400 text-sm mt-2">R{plan.price}/month</div>
                <div className="text-gray-500 text-xs mt-1">Revenue: R{plan.count * plan.price}/month</div>
              </div>
            ))}
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h2 className="text-white font-bold mb-4">📊 Service Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">API Server</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getHealthColor(systemHealth?.api || 'degraded')}`}></div>
                    <span className="text-white">{systemHealth?.api || 'Unknown'}</span>
                    <span className="text-gray-500 text-sm ml-4">Uptime: 99.9%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Database</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getHealthColor(systemHealth?.database || 'degraded')}`}></div>
                    <span className="text-white">{systemHealth?.database || 'Unknown'}</span>
                    <span className="text-gray-500 text-sm ml-4">Response: 12ms</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">WhatsApp Business API</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getHealthColor(systemHealth?.whatsapp || 'degraded')}`}></div>
                    <span className="text-white">{systemHealth?.whatsapp || 'Unknown'}</span>
                    <span className="text-gray-500 text-sm ml-4">Connected</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Stripe Payment Gateway</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getHealthColor(systemHealth?.stripe || 'degraded')}`}></div>
                    <span className="text-white">{systemHealth?.stripe || 'Unknown'}</span>
                    <span className="text-gray-500 text-sm ml-4">Configured</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h2 className="text-white font-bold mb-4">📈 System Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">12ms</div>
                  <div className="text-gray-400 text-sm">Avg API Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-gray-400 text-sm">Uptime (30d)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">1,247</div>
                  <div className="text-gray-400 text-sm">API Calls Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-gray-400 text-sm">Active Incidents</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Modal */}
      {showDocumentModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowDocumentModal(false)}>
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/20 flex justify-between items-center">
              <h2 className="text-white font-bold">ID Document - {selectedUser.businessName}</h2>
              <button onClick={() => setShowDocumentModal(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>
            <div className="p-6">
              {selectedUser.idDocumentUrl ? (
                <img src={selectedUser.idDocumentUrl} alt="ID Document" className="w-full rounded-lg" />
              ) : (
                <p className="text-gray-400 text-center py-8">No ID document uploaded yet</p>
              )}
              <div className="mt-4 flex justify-end">
                <button onClick={() => setShowDocumentModal(false)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Face Modal */}
      {showFaceModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowFaceModal(false)}>
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/20 flex justify-between items-center">
              <h2 className="text-white font-bold">Face Capture - {selectedUser.businessName}</h2>
              <button onClick={() => setShowFaceModal(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>
            <div className="p-6">
              {selectedUser.facePhotoUrl ? (
                <img src={selectedUser.facePhotoUrl} alt="Face Capture" className="w-full rounded-lg" />
              ) : (
                <p className="text-gray-400 text-center py-8">No face capture uploaded yet</p>
              )}
              <div className="mt-4 flex justify-end">
                <button onClick={() => setShowFaceModal(false)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User List Drill-down Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowUserModal(false)}>
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/20 flex justify-between items-center sticky top-0 bg-purple-900 z-10">
              <h2 className="text-white font-bold text-xl">{modalTitle}</h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>
            <div className="p-4">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="p-3 text-left text-gray-300">Business</th>
                    <th className="p-3 text-left text-gray-300">Owner</th>
                    <th className="p-3 text-left text-gray-300">Email</th>
                    <th className="p-3 text-left text-gray-300">Phone</th>
                    <th className="p-3 text-left text-gray-300">Plan</th>
                    <th className="p-3 text-left text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modalUsers.map((user: any) => (
                    <tr key={user.id} className="border-t border-white/10">
                      <td className="p-3 text-white">{user.businessName}</td>
                      <td className="p-3 text-gray-300">{user.ownerName}</td>
                      <td className="p-3 text-gray-300">{user.email}</td>
                      <td className="p-3 text-gray-300">{user.phone}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400">
                          {user.subscription || 'free'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {modalUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MRR Details Modal */}
      {showMRRModal && mrrDetails && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowMRRModal(false)}>
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/20 flex justify-between items-center sticky top-0 bg-purple-900 z-10">
              <h2 className="text-white font-bold text-xl">MRR Breakdown</h2>
              <button onClick={() => setShowMRRModal(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-emerald-400 mb-6">R{mrrDetails.total.toLocaleString()}/month</div>
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="p-3 text-left text-gray-300">Business</th>
                    <th className="p-3 text-left text-gray-300">Owner</th>
                    <th className="p-3 text-left text-gray-300">Email</th>
                    <th className="p-3 text-left text-gray-300">Plan</th>
                    <th className="p-3 text-left text-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {mrrDetails.breakdown.map((item: any) => (
                    <tr key={item.id} className="border-t border-white/10">
                      <td className="p-3 text-white">{item.businessName}</td>
                      <td className="p-3 text-gray-300">{item.ownerName}</td>
                      <td className="p-3 text-gray-300">{item.email}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400">
                          {item.plan}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-400 font-semibold">R{item.amount}</td>
                    </tr>
                  ))}
                  {mrrDetails.breakdown.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">No paid subscribers yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
