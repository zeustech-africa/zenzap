'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      {/* Header */}
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
        <h1 className="text-4xl font-bold text-white mb-6">About ZENZAP</h1>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Our Mission</h2>
            <p className="text-gray-300">To empower African businesses with simple, affordable, and powerful WhatsApp automation tools that help them grow, save time, and serve customers better.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Who We Are</h2>
            <p className="text-gray-300">ZENZAP is built by ZEUSTECH (PTY) LTD, a Cape Town-based technology company dedicated to solving real problems for African businesses. We understand the unique challenges local businesses face — from load shedding to currency volatility — and we build solutions that work.</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/30">
            <h2 className="text-xl font-bold text-white mb-2">🇿🇦 Built in Africa, for Africa</h2>
            <p className="text-gray-300">Pay in Rands, get WhatsApp support, and rest assured your data stays local. We're not a global tool with a local skin — we're built here, by people who understand your business.</p>
          </div>
        </div>
      </div>
    </div>
  );
}