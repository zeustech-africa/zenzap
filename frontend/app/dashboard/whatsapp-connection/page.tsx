'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function WhatsAppConnectionPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get user ID from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
      } catch (e) {}
    }

    // Check connection status
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/whatsapp/status');
        const data = await response.json();
        if (data.status === 'connected') {
          setStatus('connected');
        }
      } catch (error) {
        console.error('Failed to check status:', error);
      }
    };
    checkStatus();

    // Load Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FB_APP_ID || '4057562981062381',
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v22.0'
      });
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const startWhatsAppOnboarding = () => {
    setLoading(true);
    setStatus('connecting');

    window.FB.login(
      (response: any) => {
        if (response.authResponse?.code) {
          // Exchange code on backend
          fetch('/api/whatsapp/exchange-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              code: response.authResponse.code,
              userId: userId 
            })
          }).then(async (res) => {
            const data = await res.json();
            if (data.success) {
              setStatus('connected');
              // Redirect to dashboard after success
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 2000);
            } else {
              setStatus('disconnected');
              alert('Failed to connect WhatsApp. Please try again.');
            }
            setLoading(false);
          }).catch(() => {
            setStatus('disconnected');
            setLoading(false);
            alert('Connection failed. Please try again.');
          });
        } else {
          setStatus('disconnected');
          setLoading(false);
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID || '2527487861001702',
        response_type: 'code',
        override_default_response_type: true
      }
    );
  };

  if (status === 'connected') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
        <div className="container mx-auto px-6 py-12 max-w-2xl">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">WhatsApp Connected!</h1>
            <p className="text-gray-300 mb-6">
              Your WhatsApp Business account is successfully connected to ZENZAP.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
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
          <span className="text-white font-bold ml-4">Connect WhatsApp</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">💬</div>
            <h1 className="text-2xl font-bold text-white mb-2">Connect Your WhatsApp Business</h1>
            <p className="text-gray-300">
              Link your WhatsApp Business account to start automating your customer conversations.
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={startWhatsAppOnboarding}
              disabled={loading}
              className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                'Connect WhatsApp Business →'
              )}
            </button>

            <div className="bg-white/5 rounded-lg p-4 text-left">
              <h3 className="text-white font-semibold mb-2">📋 What happens next:</h3>
              <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                <li>You'll log into your Facebook Business account</li>
                <li>Grant permission for ZENZAP to manage your WhatsApp</li>
                <li>Select or create your WhatsApp Business account</li>
                <li>Enter your business phone number for verification</li>
                <li>Enter the 6-digit code sent to your phone</li>
                <li>Your WhatsApp will be connected automatically!</li>
              </ol>
            </div>

            <div className="text-yellow-500/80 text-sm bg-yellow-500/10 p-3 rounded-lg">
              <strong>Note:</strong> Your WhatsApp Business app will continue working normally. You can use both the app and ZENZAP simultaneously!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}