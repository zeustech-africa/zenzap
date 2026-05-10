'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function WhatsAppConnectionPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'pending' | 'connected' | 'expired'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    generateQRCode();
  }, []);

  useEffect(() => {
    if (sessionId && status !== 'connected') {
      const interval = setInterval(checkStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [sessionId, status]);

  const generateQRCode = async () => {
    setStatus('loading');
    setError('');

    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/whatsapp/qr/generate?userId=${userId}`);
      const data = await response.json();

      if (response.ok && data.qrCode) {
        setQrCode(data.qrCode);
        setSessionId(data.sessionId);
        setStatus('pending');
      } else {
        setError(data.error || 'Failed to generate QR code');
        setStatus('expired');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setStatus('expired');
    }
  };

  const checkStatus = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/whatsapp/qr/status/${sessionId}`);
      const data = await response.json();

      if (data.status === 'connected') {
        setStatus('connected');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (err) {
      console.error('Status check failed:', err);
    }
  };

  if (status === 'connected') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
        <div className="container mx-auto px-6 py-12 max-w-2xl">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">WhatsApp Connected!</h1>
            <p className="text-gray-300 mb-6">
              Your WhatsApp is now connected to ZENZAP.
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
            <div className="text-5xl mb-4">📱</div>
            <h1 className="text-2xl font-bold text-white mb-2">Connect Your WhatsApp</h1>
            <p className="text-gray-300">Simple 30-second setup</p>
          </div>

          {status === 'loading' ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-400 mt-4">Generating QR code...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
              <p className="text-red-300">{error}</p>
              <button
                onClick={generateQRCode}
                className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          ) : qrCode ? (
            <div>
              <div className="bg-white p-4 rounded-xl inline-block mb-6">
                <QRCodeSVG value={qrCode} size={256} />
              </div>

              <div className="bg-white/5 rounded-lg p-4 text-left mb-6">
                <h3 className="text-white font-semibold mb-3 text-center">📱 Simple 3-Step Setup:</h3>
                <ol className="text-gray-300 text-sm space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="bg-orange-500 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">1</span>
                    <span>Open WhatsApp Business on your phone</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-orange-500 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">2</span>
                    <span>Go to <strong>Settings → Linked Devices → Link a Device</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-orange-500 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">3</span>
                    <span>Scan the QR code above with your phone</span>
                  </li>
                </ol>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                <p className="text-blue-400 text-sm">
                  ⏳ Waiting for connection... {status === 'pending' && 'Scan the QR code to connect'}
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-6 text-center">
            <button
              onClick={generateQRCode}
              className="text-gray-400 hover:text-white text-sm underline"
            >
              Refresh QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}