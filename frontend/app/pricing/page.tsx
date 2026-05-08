'use client';

import Link from 'next/link';

export default function PricingPage() {
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

      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <h1 className="text-4xl font-bold text-white text-center mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-300 text-center mb-12">Pay in Rands. No hidden fees. Cancel anytime.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { name: "Free", price: "R0", period: "forever", features: ["500 messages/month", "1 agent", "Basic features"] },
            { name: "Starter", price: "R299", period: "/month", features: ["5,000 messages", "3 agents", "All core features"] },
            { name: "Pro", price: "R599", period: "/month", features: ["25,000 messages", "10 agents", "AI features + Analytics"] },
            { name: "Business", price: "R999", period: "/month", features: ["Unlimited messages", "Unlimited agents", "Priority support + API"] }
          ].map((plan) => (
            <div key={plan.name} className="bg-white/10 rounded-xl p-6 border border-white/20 text-center">
              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              <div className="mt-4">
                <span className="text-3xl font-bold text-orange-400">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-2 text-gray-300 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i}>✓ {feature}</li>
                ))}
              </ul>
              <Link href="/register" className="block mt-6 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition">Get Started</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}