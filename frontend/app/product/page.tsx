'use client';

import Link from 'next/link';

export default function ProductPage() {
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
        <h1 className="text-4xl font-bold text-white mb-6">ZENZAP Product Overview</h1>
        <div className="space-y-6">
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-2">🤖 AI-Powered Automation</h2>
            <p className="text-gray-300">Smart replies, sentiment analysis, and auto-response suggestions help you respond faster and serve more customers.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-2">📅 Built-in Booking System</h2>
            <p className="text-gray-300">Appointment booking, reminders, and cancellations — all integrated into WhatsApp.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-2">👥 Customer CRM</h2>
            <p className="text-gray-300">Track conversations, manage contacts, and segment customers with tags.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-2">🎯 Lead Capture & Sales Automation</h2>
            <p className="text-gray-300">Automatically capture leads and nurture them through automated sequences.</p>
          </div>
        </div>
      </div>
    </div>
  );
}