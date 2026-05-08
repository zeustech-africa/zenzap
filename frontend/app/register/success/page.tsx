'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const businessName = searchParams.get('businessName') || '';
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<{ id: string; message: string; fromAdmin: boolean; timestamp: string; fileUrl?: string; fileName?: string }[]>([]);
  const [userId, setUserId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load userId from localStorage
  useEffect(() => {
    const tempUserId = localStorage.getItem('tempUserId');
    if (tempUserId) {
      setUserId(tempUserId);
    }
  }, []);

  // Message and status polling - runs once userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/messages/${userId}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/auth/status/${userId}`);
        const data = await response.json();

        if (data.status === 'active' || data.status === 'approved') {
          localStorage.setItem('pendingEmail', email);
          router.push('/unlock');
        }
      } catch (error) {
        console.error('Failed to check status:', error);
      }
    };

    // Initial fetch + status check
    fetchMessages();
    checkStatus();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchMessages();
      checkStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, email, router]);

  const sendMessage = async () => {
    if (!chatMessage.trim() || !userId) return;
    
    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName: businessName,
          message: chatMessage,
          fromAdmin: false
        })
      });
      
      if (response.ok) {
        setChatMessage('');
        // Messages will be picked up by the next poll interval
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !userId) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', userId);
    formData.append('fileName', selectedFile.name);
    
    try {
      const response = await fetch('/api/chat/upload-file', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setSelectedFile(null);
        // Messages will be picked up by the next poll interval
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/zenzap-logo-icon.png" alt="ZENZAP" className="h-8 w-8" />
            <span className="text-white font-bold">ZENZAP</span>
            <span className="text-orange-400 text-xs">by ZEUSTECH</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">✓</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Registration Submitted!</h1>
                <p className="text-gray-300 mb-6">
                  Your account is pending admin approval. We'll notify you via email once approved.
                </p>
                <div className="bg-white/5 rounded-lg p-4 mb-8">
                  <p className="text-gray-300 text-sm">A confirmation email has been sent to:</p>
                  <p className="text-orange-400 font-medium">{email}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h3 className="text-white font-semibold mb-2">📌 What happens next?</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>✓ Our verification team reviews your documents (1-24 hours)</li>
                  <li>✓ You'll receive an email when approved</li>
                  <li>✓ This page will automatically redirect you when approved</li>
                </ul>
              </div>

              <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30">
                <h3 className="text-white font-semibold mb-2">💡 Did you know?</h3>
                <p className="text-gray-300 text-sm">ZENZAP customers save an average of 15 hours per week on customer messaging. That's time you can reinvest into growing your business.</p>
              </div>
            </div>
          </div>

          {/* Chat with Admin */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col h-[500px]">
            <div className="p-4 border-b border-white/20">
              <h2 className="text-white font-bold">💬 Chat with Support</h2>
              <p className="text-gray-400 text-sm">Have questions while you wait? Message us here.</p>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.fromAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${msg.fromAdmin ? 'bg-white/10' : 'bg-orange-500'}`}>
                    <p className="text-white text-sm">{msg.message}</p>
                    {msg.fileUrl && msg.fileName && (
                      <a
                        href={msg.fileUrl}
                        download={msg.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-300 text-xs underline mt-1 inline-block"
                      >
                        📥 Download {msg.fileName}
                      </a>
                    )}
                    <span className="text-gray-400 text-xs mt-1 block">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-white/20">
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-white text-xs truncate flex-1">📎 {selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition">
                  {uploading ? '⏳' : '📎'}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
                {selectedFile ? (
                  <button
                    onClick={handleFileUpload}
                    disabled={uploading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {uploading ? 'Sending...' : 'Upload'}
                  </button>
                ) : (
                  <button
                    onClick={sendMessage}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    Send
                  </button>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-2">{'Average response time: < 1 hour'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="border-t border-white/20 pt-4">
            <h3 className="text-white font-semibold mb-3">✨ Why businesses choose ZENZAP</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-orange-400 text-sm font-semibold">🇿🇦 Pay in Rands</div>
                <p className="text-gray-400 text-xs">No USD conversion fees. What you see is what you pay.</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-orange-400 text-sm font-semibold">⚡ 10-Minute Setup</div>
                <p className="text-gray-400 text-xs">Get started faster than any competitor.</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-orange-400 text-sm font-semibold">🤖 AI-Powered</div>
                <p className="text-gray-400 text-xs">Smart replies and automation that learns.</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-orange-400 text-sm font-semibold">💰 Save 40+ hours/month</div>
                <p className="text-gray-400 text-xs">Time you can reinvest into growing your business.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
            <div className="flex gap-3">
              <div className="text-2xl">🚀</div>
              <div>
                <h3 className="text-white font-semibold">Cheaper than global competitors</h3>
                <p className="text-gray-300 text-sm">WATI starts at $49/month (~R900). Twilio charges per message. ZENZAP gives you more features for less money — starting at just R299/month.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}