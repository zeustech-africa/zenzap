'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store tempUserId for chat on success page
        if (data.userId) {
          localStorage.setItem('tempUserId', data.userId);
        }
        // Store registration data for persistence between steps
        localStorage.setItem('registrationData', JSON.stringify({
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone
        }));
        router.push('/register/id-upload');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/zenzap-logo-icon.png" alt="ZENZAP" className="h-8 w-8" />
            <span className="text-white font-bold">ZENZAP</span>
            <span className="text-orange-400 text-xs">by ZEUSTECH</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
          <div className="w-3 h-3 rounded-full bg-white/30"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-gray-300 mb-6">Join hundreds of African businesses automating their WhatsApp</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Owner Name *</label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">WhatsApp Business Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="+27 XX XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Create a secure password"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 mt-4"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-gray-300 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-orange-400 hover:text-orange-300">
                Sign in
              </Link>
            </p>
          </div>

          {/* Right Column - Information / Selling Points */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🇿🇦</div>
              <h3 className="text-white font-bold text-lg mb-2">Built for Africa</h3>
              <p className="text-gray-300 text-sm">Pay in Rands (ZAR), not Dollars. No hidden conversion fees. WhatsApp support in your timezone.</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-white font-bold text-lg mb-2">10-Minute Setup</h3>
              <p className="text-gray-300 text-sm">Connect your WhatsApp Business number, choose your industry template, and you're ready to go. No coding required.</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-white font-bold text-lg mb-2">AI-Powered Automation</h3>
              <p className="text-gray-300 text-sm">Smart replies, sentiment analysis, and auto-response suggestions help you respond faster and serve more customers.</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-white font-bold text-lg mb-2">Save Money, Grow Faster</h3>
              <p className="text-gray-300 text-sm">Businesses save up to 40 hours per month using ZENZAP. That's time you can reinvest into growing your business.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}