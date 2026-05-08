'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PartnerPage() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Send to backend
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/zenzap-logo-icon.png" alt="ZENZAP" className="h-8 w-8" />
            <span className="text-white font-bold">ZENZAP</span>
            <span className="text-orange-400 text-xs">by ZEUSTECH</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white transition">Login</Link>
            <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition">Get Started</Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-6">Partner with ZENZAP</h1>
        <p className="text-gray-300 mb-8">Join our partner program and help businesses across Africa automate their WhatsApp communication.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <div className="text-3xl mb-3">🤝</div>
            <h2 className="text-xl font-bold text-white">Why Partner?</h2>
            <ul className="mt-4 space-y-2 text-gray-300">
              <li>✓ Earn recurring commission</li>
              <li>✓ White-label options available</li>
              <li>✓ Dedicated support team</li>
              <li>✓ Access to exclusive resources</li>
            </ul>
          </div>
          
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <div className="text-3xl mb-3">📈</div>
            <h2 className="text-xl font-bold text-white">Partner Tiers</h2>
            <ul className="mt-4 space-y-2 text-gray-300">
              <li>✓ Bronze: 15% commission</li>
              <li>✓ Silver: 20% commission</li>
              <li>✓ Gold: 25% commission</li>
              <li>✓ Platinum: Custom rates</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">Apply to Partner</h2>
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-white text-lg">Application received!</p>
              <p className="text-gray-400 mt-2">We'll contact you within 48 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input type="email" placeholder="Email" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              <input type="text" placeholder="Company Name" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} required />
              <input type="tel" placeholder="Phone Number" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <textarea placeholder="Tell us about your business" rows={4} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition">Submit Application</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}