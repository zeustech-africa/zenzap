'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function WelcomePage() {
  const [activeTab, setActiveTab] = useState('salon');

  const industryTemplates = {
    salon: {
      title: "Salon & Spa",
      features: ["Appointment booking", "Cancellation reminders", "Customer history", "Loyalty tracking", "Promotional broadcasts"]
    },
    restaurant: {
      title: "Restaurant & Cafe",
      features: ["Table reservations", "Menu sharing", "Order taking", "Delivery updates", "Feedback collection"]
    },
    realestate: {
      title: "Real Estate",
      features: ["Property inquiries", "Viewing scheduling", "Document sharing", "Follow-up automation", "Lead scoring"]
    },
    retail: {
      title: "Retail & E-commerce",
      features: ["Product catalog", "Order tracking", "Customer support", "Abandoned cart recovery", "Promotional campaigns"]
    },
    healthcare: {
      title: "Healthcare & Wellness",
      features: ["Appointment booking", "Prescription refills", "Patient reminders", "Follow-up care", "Telehealth links"]
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header - Fixed at top */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-orange-800/95 backdrop-blur-sm z-50 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo - Top Left */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/zenzap-logo-icon.png" alt="ZENZAP" className="h-8 w-8" />
            <div>
              <span className="text-white font-bold text-lg">ZENZAP</span>
              <span className="text-orange-400 text-xs ml-1">by ZEUSTECH</span>
            </div>
          </Link>
          
          {/* Navigation - Top Right */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white transition">
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-orange-700">
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/images/zenzap-hero-bg.jpg')" }}
        ></div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Turn WhatsApp into your{' '}
            <span className="text-orange-400">business superpower.</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Automate customer conversations, boost sales, and never miss a message—all from one simple dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/setup" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition transform hover:scale-105"
            >
              🚀 Start Free Trial — Setup in 10 Minutes
            </Link>
            <a 
              href="#how-it-works" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-3 rounded-full font-semibold transition border border-white/20"
            >
              See How It Works
            </a>
          </div>
          <div className="mt-8 text-gray-300 text-sm">
            ✅ No credit card required • ✅ Cancel anytime • ✅ 14-day free trial
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">THE PROBLEM</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
              WhatsApp automation shouldn't be this hard
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">😤</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Too Complex</h3>
              <p className="text-gray-600">Most tools require coding or technical expertise. Not ZENZAP.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Too Expensive</h3>
              <p className="text-gray-600">Priced in USD with hidden fees. We charge in Rands, transparently.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Not Built for Africa</h3>
              <p className="text-gray-600">Global tools don't understand local businesses. We do.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">THE SOLUTION</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
              Finally, WhatsApp automation made simple
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: "⚡", title: "10-Minute Setup", desc: "Connect your WhatsApp, choose your industry, and you're ready. No coding. No hassle." },
              { icon: "🤖", title: "Smart Automation", desc: "Auto-reply to customers, send reminders, capture leads — automatically." },
              { icon: "📅", title: "Built-in Booking", desc: "Appointments, reservations, and reminders — all integrated." },
              { icon: "📊", title: "Customer CRM", desc: "Track conversations, manage contacts, and grow your business." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 bg-white rounded-xl shadow-sm">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Templates Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">READY-MADE TEMPLATES</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
              Built for your business
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-4">
              Choose your industry and get a complete automation setup in minutes — no customization needed.
            </p>
          </div>

          {/* Industry Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Object.keys(industryTemplates).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-full transition ${
                  activeTab === key
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {industryTemplates[key as keyof typeof industryTemplates].title}
              </button>
            ))}
          </div>

          {/* Active Template Content */}
          <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {industryTemplates[activeTab as keyof typeof industryTemplates].title}
                </h3>
                <ul className="space-y-2">
                  {industryTemplates[activeTab as keyof typeof industryTemplates].features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <span className="text-orange-500">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/setup" 
                  className="inline-block mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition"
                >
                  Get Started with {industryTemplates[activeTab as keyof typeof industryTemplates].title} →
                </Link>
              </div>
              <div className="flex-1">
                <img 
                  src={`/images/zenzap-${activeTab === 'realestate' ? 'business-owner' : activeTab === 'healthcare' ? 'support-team' : 'shopping'}.jpg`} 
                  alt={industryTemplates[activeTab as keyof typeof industryTemplates].title}
                  className="rounded-xl shadow-lg w-full h-48 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">PRICING</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-4">
              Pay in Rands. No hidden fees. Cancel anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: "Free", price: "R0", period: "forever", features: ["500 messages/month", "1 agent", "Basic features"] },
              { name: "Starter", price: "R299", period: "/month", features: ["5,000 messages", "3 agents", "All core features"], popular: true },
              { name: "Pro", price: "R599", period: "/month", features: ["25,000 messages", "10 agents", "AI features + Analytics"] },
              { name: "Business", price: "R999", period: "/month", features: ["Unlimited messages", "Unlimited agents", "Priority support + API"] }
            ].map((plan) => (
              <div key={plan.name} className={`bg-white rounded-xl p-6 shadow-sm ${plan.popular ? 'border-2 border-orange-500 relative' : 'border border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-gray-600 text-sm">✓ {feature}</li>
                  ))}
                </ul>
                <Link href="/setup" className={`block text-center py-2 rounded-full transition ${plan.popular ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How it works</h2>
            <p className="text-gray-600 mt-4">From signup to savings in 10 minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Connect", desc: "Link your WhatsApp Business number in minutes" },
              { step: "2", title: "Choose", desc: "Select your industry template or customize your own" },
              { step: "3", title: "Automate", desc: "Start responding to customers automatically" }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-orange-700">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your WhatsApp?
          </h2>
          <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
            Join hundreds of African businesses already automating their customer conversations with ZENZAP.
          </p>
          <Link 
            href="/setup" 
            className="inline-block bg-white text-purple-900 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold transition transform hover:scale-105"
          >
            Start Your Free Trial — Setup in 10 Minutes
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            {/* Brand Column */}
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/images/zenzap-logo-icon.png" alt="ZENZAP" className="h-8 w-8" />
                <span className="text-white font-bold">ZENZAP</span>
              </div>
              <p className="text-gray-500 text-sm">
                Turn WhatsApp into your business superpower.
              </p>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-3">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-500 text-sm hover:text-orange-400 transition">About Us</Link></li>
                <li><Link href="/events" className="text-gray-500 text-sm hover:text-orange-400 transition">Events</Link></li>
                <li><Link href="/partner" className="text-gray-500 text-sm hover:text-orange-400 transition">Partner</Link></li>
              </ul>
            </div>
            
            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-3">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/product" className="text-gray-500 text-sm hover:text-orange-400 transition">Overview</Link></li>
                <li><Link href="/pricing" className="text-gray-500 text-sm hover:text-orange-400 transition">Pricing</Link></li>
                <li><Link href="/demo" className="text-gray-500 text-sm hover:text-orange-400 transition">Demo</Link></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-3">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/case-studies" className="text-gray-500 text-sm hover:text-orange-400 transition">Case Studies</Link></li>
                <li><Link href="/blogs" className="text-gray-500 text-sm hover:text-orange-400 transition">Blogs</Link></li>
                <li><Link href="/resources" className="text-gray-500 text-sm hover:text-orange-400 transition">Resources</Link></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-3">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-500 text-sm hover:text-orange-400 transition">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-500 text-sm hover:text-orange-400 transition">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 ZENZAP by ZEUSTECH (PTY) LTD. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}