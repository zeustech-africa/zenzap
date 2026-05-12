'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FacebookPage {
  id: string;
  pageId: string;
  pageName: string;
  isConnected: boolean;
  connectedAt: string;
}

export default function FacebookDashboardPage() {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/facebook/pages?userId=${userId}`);
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectFacebook = async () => {
    setConnecting(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/facebook/auth-url?userId=${userId}`);
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      alert('Failed to connect Facebook');
      setConnecting(false);
    }
  };

  const disconnectPage = async (pageId: string) => {
    if (!confirm('Disconnect this Facebook page?')) return;

    try {
      const userId = localStorage.getItem('userId');
      await fetch(`/api/facebook/disconnect/${pageId}?userId=${userId}`, { method: 'DELETE' });
      await fetchPages();
    } catch (error) {
      alert('Failed to disconnect');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading Facebook pages...</div>
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
          <span className="text-white font-bold ml-4">Facebook Messenger</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">💬 Facebook Messenger</h1>
          <button
            onClick={connectFacebook}
            disabled={connecting}
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-lg transition"
          >
            {connecting ? 'Connecting...' : '+ Connect Facebook Page'}
          </button>
        </div>

        {/* Connected Pages */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="p-4 border-b border-white/20">
            <h2 className="text-white font-bold">Connected Pages</h2>
          </div>
          <div className="divide-y divide-white/10">
            {pages.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No Facebook pages connected. Click "Connect Facebook Page" to start.
              </div>
            ) : (
              pages.map((page) => (
                <div key={page.id} className="p-4 flex justify-between items-center hover:bg-white/5">
                  <div>
                    <div className="text-white font-medium">{page.pageName}</div>
                    <div className="text-gray-400 text-sm">Page ID: {page.pageId}</div>
                    <div className="text-gray-500 text-xs">Connected: {new Date(page.connectedAt).toLocaleDateString()}</div>
                  </div>
                  <button
                    onClick={() => disconnectPage(page.pageId)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded text-sm transition"
                  >
                    Disconnect
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-blue-400 font-semibold mb-2">💡 How Facebook Messenger Works</h3>
          <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
            <li>Connect your Facebook Page with one click</li>
            <li>All messages will appear in your unified inbox</li>
            <li>Reply to Facebook messages directly from ZENZAP</li>
            <li>Works alongside WhatsApp and Instagram</li>
          </ul>
        </div>
      </div>
    </div>
  );
}