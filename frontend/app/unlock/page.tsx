'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UnlockPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailPrepopulated, setIsEmailPrepopulated] = useState(false);

  useEffect(() => {
    // Get email from URL or localStorage
    const storedEmail = localStorage.getItem('pendingEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setIsEmailPrepopulated(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await 
fetch('https://zenzap-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.removeItem('pendingEmail');
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
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

      <div className="container mx-auto px-6 py-16 max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          
          <h1 className="text-xl font-bold text-white mb-2">Your Account is Approved!</h1>
          <p className="text-gray-300 text-sm mb-6">
            Your account has been approved. Please sign in to access your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                readOnly={isEmailPrepopulated}
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                placeholder="Your password"
              />
            </div>

            {error && (
              <div className="p-2 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Go to Dashboard →'}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
              <div className="flex gap-3">
                <div className="text-xl">✅</div>
                <div>
                  <h3 className="text-white font-semibold text-sm">What you get after approval:</h3>
                  <ul className="text-gray-400 text-xs mt-1 space-y-1">
                    <li>• Full access to WhatsApp automation dashboard</li>
                    <li>• Industry-specific templates (Salon, Restaurant, Real Estate)</li>
                    <li>• AI-powered reply suggestions</li>
                    <li>• Customer CRM and lead management</li>
                    <li>• 24/7 WhatsApp support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
