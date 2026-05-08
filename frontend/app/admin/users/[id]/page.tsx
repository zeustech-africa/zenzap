'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  status: string;
  subscription: string;
  registeredAt: string;
  idDocumentUrl?: string;
  facePhotoUrl?: string;
  messages?: any[];
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDocument, setShowDocument] = useState(false);
  const [showFace, setShowFace] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchUser();
    fetchMessages();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/messages/${userId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName: user?.businessName || '',
          message: messageText,
          fromAdmin: true
        })
      });
      setMessageText('');
      fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      const endpointMap: Record<string, string> = {
        approved: `/api/admin/approve/${userId}`,
        rejected: `/api/admin/reject/${userId}`,
        suspended: `/api/admin/suspend/${userId}`,
        pending: `/api/admin/approve/${userId}`,
      };
      const url = endpointMap[status] || `/api/admin/approve/${userId}`;
      await fetch(url, { method: 'POST' });
      fetchUser();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const updateSubscription = async (subscription: string) => {
    try {
      await fetch(`/api/admin/update-subscription/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: subscription })
      });
      fetchUser();
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
      <div className="text-white">Loading user details...</div>
    </div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
      <div className="text-white">User not found</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition">← Dashboard</Link>
            <span className="text-white font-bold">User Details: {user.businessName}</span>
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

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-white font-bold text-lg mb-4">User Information</h2>
            <div className="space-y-3">
              <div>
                <div className="text-gray-400 text-sm">Business Name</div>
                <div className="text-white font-medium">{user.businessName}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Owner Name</div>
                <div className="text-white">{user.ownerName}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Email</div>
                <div className="text-white">{user.email}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Phone</div>
                <div className="text-white">{user.phone}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Registered</div>
                <div className="text-white">{new Date(user.registeredAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Status</div>
                <select
                  value={user.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className="mt-1 px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Subscription</div>
                <select
                  value={user.subscription}
                  onChange={(e) => updateSubscription(e.target.value)}
                  className="mt-1 px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter (R299)</option>
                  <option value="pro">Pro (R599)</option>
                  <option value="business">Business (R999)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-white font-bold text-lg mb-4">Verification Documents</h2>
            <div className="space-y-4">
              <button
                onClick={() => setShowDocument(true)}
                className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-lg text-center transition"
              >
                🆔 View ID Document
              </button>
              <button
                onClick={() => setShowFace(true)}
                className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-lg text-center transition"
              >
                👤 View Face Capture
              </button>
              {user.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => updateStatus('approved')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
                  >
                    Approve User
                  </button>
                  <button
                    onClick={() => updateStatus('rejected')}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
                  >
                    Reject User
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="bg-white/10 rounded-xl border border-white/20 flex flex-col h-[500px]">
            <div className="p-4 border-b border-white/20">
              <h2 className="text-white font-bold">💬 Conversation</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.fromAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${msg.fromAdmin ? 'bg-orange-500' : 'bg-white/10'}`}>
                    <p className="text-white text-sm">{msg.message}</p>
                    <span className="text-gray-400 text-xs mt-1 block">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message to the user..."
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Modal */}
      {showDocument && user.idDocumentUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowDocument(false)}>
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/20 flex justify-between items-center">
              <h2 className="text-white font-bold">ID Document</h2>
              <button onClick={() => setShowDocument(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>
            <div className="p-6">
              <img src={user.idDocumentUrl} alt="ID Document" className="w-full rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Face Modal */}
      {showFace && user.facePhotoUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowFace(false)}>
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-white/20 flex justify-between items-center">
              <h2 className="text-white font-bold">Face Capture</h2>
              <button onClick={() => setShowFace(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>
            <div className="p-6">
              <img src={user.facePhotoUrl} alt="Face Capture" className="w-full rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}