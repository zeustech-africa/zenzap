'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface InstagramAccount {
  connected: boolean;
  username?: string;
  pageName?: string;
}

interface InstagramMessage {
  id: string;
  fromId: string;
  fromName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export default function InstagramPage() {
  const [account, setAccount] = useState<InstagramAccount | null>(null);
  const [messages, setMessages] = useState<InstagramMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchStatus();
    fetchMessages();
  }, []);

  const fetchStatus = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/instagram/status?userId=${userId}`);
      const data = await response.json();
      setAccount(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/instagram/messages?userId=${userId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectInstagram = async () => {
    try {
      const response = await fetch('/api/instagram/auth-url');
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      alert('Failed to connect Instagram');
    }
  };

  const disconnectInstagram = async () => {
    if (!confirm('Disconnect Instagram? You will no longer receive DMs in ZENZAP.')) return;
    
    try {
      const userId = localStorage.getItem('userId');
      await fetch(`/api/instagram/disconnect?userId=${userId}`, { method: 'DELETE' });
      setAccount(null);
    } catch (error) {
      alert('Failed to disconnect');
    }
  };

  const sendReply = async (toId: string) => {
    if (!replyMessage.trim()) return;
    
    setSending(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('/api/instagram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, to: toId, message: replyMessage })
      });
      
      if (response.ok) {
        setReplyingTo(null);
        setReplyMessage('');
        await fetchMessages();
      } else {
        alert('Failed to send reply');
      }
    } catch (error) {
      alert('Error sending reply');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
          <span className="text-white font-bold ml-4">Instagram DMs</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Connection Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
          {account?.connected ? (
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white font-semibold">Connected as @{account.username}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">Page: {account.pageName}</p>
              </div>
              <button
                onClick={disconnectInstagram}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-4">📸</div>
              <h2 className="text-xl font-bold text-white mb-2">Connect Instagram</h2>
              <p className="text-gray-400 mb-4">Receive and reply to Instagram DMs from ZENZAP</p>
              <button
                onClick={connectInstagram}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg transition"
              >
                Connect Instagram Business
              </button>
              <p className="text-gray-500 text-xs mt-4">
                You need an Instagram Business account connected to a Facebook Page
              </p>
            </div>
          )}
        </div>

        {/* Messages Inbox */}
        {account?.connected && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/20">
              <h2 className="text-white font-bold">📬 Instagram DMs</h2>
            </div>
            <div className="divide-y divide-white/10">
              {messages.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No Instagram messages yet. When customers DM you, they'll appear here.
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-4 hover:bg-white/5">
                    <div className="flex justify-between">
                      <div>
                        <span className="text-white font-medium">{msg.fromName}</span>
                        <p className="text-gray-300 text-sm mt-1">{msg.message}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500 text-xs">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                        {replyingTo === msg.id ? (
                          <div className="mt-2">
                            <input
                              type="text"
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder="Type reply..."
                              className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            />
                            <button
                              onClick={() => sendReply(msg.fromId)}
                              disabled={sending}
                              className="ml-2 bg-orange-500 text-white px-2 py-1 rounded text-sm"
                            >
                              Send
                            </button>
                            <button onClick={() => setReplyingTo(null)} className="ml-1 text-gray-400 text-sm">Cancel</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingTo(msg.id)}
                            className="mt-2 text-orange-400 text-sm hover:text-orange-300"
                          >
                            Reply →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}