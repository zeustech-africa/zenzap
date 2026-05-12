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
  registeredAt: string;
  idDocumentUrl?: string | null;
  facePhotoUrl?: string | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/admin/users' 
        : `/api/admin/users?filter=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/approve/${userId}`, { method: 'POST' });
      if (res.ok) {
        fetchUsers();
      } else {
        alert('Failed to approve user');
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Reject this user registration?')) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/reject/${userId}`, { method: 'POST' });
      if (res.ok) {
        fetchUsers();
      } else {
        alert('Failed to reject user');
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">Pending</span>;
      case 'approved': return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Approved</span>;
      case 'rejected': return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">Rejected</span>;
      case 'suspended': return <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs">Suspended</span>;
      default: return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case 'free': return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs">Free</span>;
      case 'starter': return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">Starter</span>;
      case 'pro': return <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">Pro</span>;
      case 'business': return <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs">Business</span>;
      default: return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs">{subscription}</span>;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    return matchesSearch;
  });

  const exportUsers = async () => {
    const token = localStorage.getItem('adminToken');
    window.open('/api/admin/export/users?token=' + token, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-gray-400">Loading users...</div>
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
          <span className="text-white font-bold ml-4">User Management</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'rejected', 'suspended'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition ${
                  filter === f 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
            <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 w-full md:w-80"
          />
          <button onClick={exportUsers} className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition">
            📥 Export CSV
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300">Business</th>
                  <th className="text-left p-4 text-gray-300">Owner</th>
                  <th className="text-left p-4 text-gray-300">Contact</th>
                  <th className="text-left p-4 text-gray-300">Status</th>
                  <th className="text-left p-4 text-gray-300">Plan</th>
                  <th className="text-left p-4 text-gray-300">Registered</th>
                  <th className="text-left p-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-white/10">
                      <td className="p-4 text-white font-medium">{user.businessName || '-'}</td>
                      <td className="p-4 text-gray-300">{user.ownerName || '-'}</td>
                      <td className="p-4">
                        <div className="text-white">{user.email}</div>
                        <div className="text-gray-400 text-sm">{user.phone}</div>
                      </td>
                      <td className="p-4">{getStatusBadge(user.status)}</td>
                      <td className="p-4">{getSubscriptionBadge(user.subscription)}</td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(user.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {user.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(user.id)}
                                disabled={actionLoading === user.id}
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded text-sm disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(user.id)}
                                disabled={actionLoading === user.id}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded text-sm disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {(user.idDocumentUrl || user.facePhotoUrl) && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDocumentModal(true);
                              }}
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded text-sm"
                            >
                              View Docs
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Document Modal */}
      {showDocumentModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-2xl w-full p-6">
            <h2 className="text-white font-bold text-lg mb-4">User Documents</h2>
            <div className="grid grid-cols-2 gap-4">
              {selectedUser.idDocumentUrl && (
                <div>
                  <p className="text-gray-300 text-sm mb-2">ID Document</p>
                  <img 
                    src={selectedUser.idDocumentUrl} 
                    alt="ID Document" 
                    className="rounded-lg max-h-64 object-contain bg-black/30"
                  />
                </div>
              )}
              {selectedUser.facePhotoUrl && (
                <div>
                  <p className="text-gray-300 text-sm mb-2">Face Photo</p>
                  <img 
                    src={selectedUser.facePhotoUrl} 
                    alt="Face Photo" 
                    className="rounded-lg max-h-64 object-contain bg-black/30"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}