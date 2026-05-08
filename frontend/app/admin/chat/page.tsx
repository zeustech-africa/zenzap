'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: boolean;
}

interface Message {
  id: string;
  message: string;
  fromAdmin: boolean;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get('userId');
  const selectedUserName = searchParams.get('name');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchConversations();
    
    // Refresh conversations every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUserId && selectedUserName) {
      setSelectedUser({ id: selectedUserId, name: selectedUserName });
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId, selectedUserName]);

  // Refresh messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      const interval = setInterval(() => fetchMessages(selectedUser.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${userId}`);
      const data = await response.json();
      setMessages(data);
      // Mark as read
      await fetch(`/api/chat/read/${userId}`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;
    
    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          userName: selectedUser.name,
          message: messageText,
          fromAdmin: true,
          toUserId: selectedUser.id
        })
      });
      
      if (response.ok) {
        setMessageText('');
        fetchMessages(selectedUser.id);
        fetchConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const selectConversation = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    fetchMessages(userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition">
              ← Dashboard
            </Link>
            <span className="text-white font-bold">Support Chat</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/20">
              <h2 className="text-white font-bold">Conversations</h2>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => selectConversation(conv.userId, conv.userName)}
                  className={`w-full text-left p-4 hover:bg-white/5 transition ${
                    selectedUser?.id === conv.userId ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-medium">{conv.userName}</div>
                      <div className="text-gray-400 text-sm truncate max-w-[150px]">{conv.lastMessage}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-xs">{new Date(conv.lastTimestamp).toLocaleTimeString()}</div>
                      {conv.unread && (
                        <div className="mt-1 w-2 h-2 bg-orange-500 rounded-full ml-auto"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {conversations.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  No conversations yet
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex flex-col h-[600px]">
            {selectedUser ? (
              <>
                <div className="p-4 border-b border-white/20">
                  <div className="text-white font-bold">{selectedUser.name}</div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.fromAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg ${msg.fromAdmin ? 'bg-orange-500' : 'bg-white/10'}`}>
                        {msg.fileUrl ? (
                          <div>
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white underline flex items-center gap-2"
                            >
                              📎 Download {msg.fileName || 'file'}
                            </a>
                          </div>
                        ) : (
                          <p className="text-white text-sm">{msg.message}</p>
                        )}
                        <span className="text-gray-400 text-xs mt-1 block">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
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
                      placeholder="Type your reply..."
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading chats...</div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}