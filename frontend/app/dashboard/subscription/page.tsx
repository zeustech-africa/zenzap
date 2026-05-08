'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Plan {
  name: string;
  price: number;
  messages: number | string;
  agents: number | string;
  monthly?: boolean;
  yearly?: boolean;
  discount?: string;
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/default');
      const data = await response.json();
      setCurrentSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (planKey: string, plan: Plan) => {
    setProcessing(planKey);
    try {
      const response = await fetch(`/api/subscribe/${planKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: 'default',
          email: 'business@example.com',
          name: 'Business Owner',
          returnUrl: window.location.origin + '/dashboard/subscription/success'
        })
      });
      
      const data = await response.json();
      
      // Create form and submit to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.paymentUrl;
      
      for (const [key, value] of Object.entries(data.formData)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      }
      
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      alert('Payment initiation failed. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading subscription plans...</div>
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
          <span className="text-white font-bold ml-4">Subscription Plans</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Current Subscription Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-white font-bold mb-4">Current Plan</h2>
          {currentSubscription?.status === 'active' ? (
            <div>
              <div className="text-2xl font-bold text-white mb-2">
                {currentSubscription.plan === 'starter' ? 'Starter Plan' : 
                 currentSubscription.plan === 'pro' ? 'Pro Plan' : 'Business Plan'}
              </div>
              <div className="text-gray-300">
                Active until: {new Date(currentSubscription.endDate).toLocaleDateString()}
              </div>
              <div className="text-green-400 mt-2">
                ✅ {currentSubscription.daysRemaining} days remaining
              </div>
            </div>
          ) : (
            <div>
              <div className="text-white mb-2">Free Plan</div>
              <div className="text-gray-400">Upgrade to unlock more features</div>
            </div>
          )}
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          {plans.starter && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-white mb-2">Starter</h2>
              <div className="text-3xl font-bold text-orange-400 mb-4">R{plans.starter.price}<span className="text-sm text-gray-400">/month</span></div>
              <ul className="space-y-2 mb-6">
                <li className="text-gray-300">✓ {plans.starter.messages.toLocaleString()} messages/month</li>
                <li className="text-gray-300">✓ {plans.starter.agents} agents</li>
                <li className="text-gray-300">✓ Core features</li>
                <li className="text-gray-300">✓ Email support</li>
              </ul>
              <button
                onClick={() => subscribe('starter', plans.starter)}
                disabled={processing === 'starter'}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {processing === 'starter' ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          )}

          {/* Pro Plan */}
          {plans.pro && (
            <div className="bg-white/15 backdrop-blur-md rounded-xl border-2 border-orange-500 p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Pro</h2>
              <div className="text-3xl font-bold text-orange-400 mb-4">R{plans.pro.price}<span className="text-sm text-gray-400">/month</span></div>
              <ul className="space-y-2 mb-6">
                <li className="text-gray-300">✓ {plans.pro.messages.toLocaleString()} messages/month</li>
                <li className="text-gray-300">✓ {plans.pro.agents} agents</li>
                <li className="text-gray-300">✓ AI features</li>
                <li className="text-gray-300">✓ Analytics dashboard</li>
                <li className="text-gray-300">✓ Priority support</li>
              </ul>
              <button
                onClick={() => subscribe('pro', plans.pro)}
                disabled={processing === 'pro'}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {processing === 'pro' ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          )}

          {/* Business Plan */}
          {plans.business && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-white mb-2">Business</h2>
              <div className="text-3xl font-bold text-orange-400 mb-4">R{plans.business.price}<span className="text-sm text-gray-400">/month</span></div>
              <ul className="space-y-2 mb-6">
                <li className="text-gray-300">✓ {typeof plans.business.messages === 'number' ? plans.business.messages.toLocaleString() : plans.business.messages} messages/month</li>
                <li className="text-gray-300">✓ {plans.business.agents} agents</li>
                <li className="text-gray-300">✓ Everything in Pro</li>
                <li className="text-gray-300">✓ API access</li>
                <li className="text-gray-300">✓ Dedicated support</li>
              </ul>
              <button
                onClick={() => subscribe('business', plans.business)}
                disabled={processing === 'business'}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {processing === 'business' ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>🔒 Secure payments via PayFast (South Africa's leading payment gateway)</p>
          <p>✅ Credit cards, Instant EFT, and more accepted</p>
          <p>💰 14-day money-back guarantee. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}