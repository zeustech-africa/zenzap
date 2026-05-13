'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    messagesPerMonth: number;
    agents: number;
  };
  popular?: boolean;
}

export default function SubscriptionPage() {
  const [loading, setLoading] = useState<string | null>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zenzap-backend.onrender.com/api';

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: [
        'Connect WhatsApp Business',
        'Basic Inbox',
        '5 Auto-Replies',
        '100 Contacts',
        '10 Broadcasts/month',
        '3 Templates',
        '1 Flow',
        '10 Products in Catalog',
        'Basic Support'
      ],
      limits: { messagesPerMonth: 500, agents: 1 }
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 299,
      features: [
        'Everything in Free',
        'Unlimited Auto-Replies',
        '1,000 Contacts',
        '100 Broadcasts/month',
        '20 Templates',
        '5 Flows',
        '100 Products in Catalog',
        'Agent Performance Tracking',
        'Quality Rating Dashboard'
      ],
      limits: { messagesPerMonth: 5000, agents: 3 }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 599,
      features: [
        'Everything in Starter',
        'Unlimited Contacts',
        'Unlimited Broadcasts',
        'Unlimited Templates',
        'Unlimited Flows',
        'AI Natural Language Understanding',
        'Instagram DM Integration',
        'Abandoned Cart Recovery',
        'Payment Links',
        'Webhook Integrations'
      ],
      limits: { messagesPerMonth: 25000, agents: 10 },
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: 999,
      features: [
        'Everything in Pro',
        'Shopify Integration',
        'HubSpot CRM Integration',
        'Salesforce CRM Integration',
        'WhatsApp Voice/Video Calls',
        'Green Tick Verification Guide',
        'Opt-in Management',
        'Coexistence Mode',
        'Priority Support',
        'API Access'
      ],
      limits: { messagesPerMonth: -1, agents: -1 }
    }
  ];

  const handleSubscribe = async (plan: Plan) => {
    if (plan.id === 'free') {
      alert('You are already on the Free plan.');
      return;
    }

    setLoading(plan.id);
    
    // Get current user ID from localStorage or context
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user || !user.id) {
      alert('Please log in again to continue.');
      setLoading(null);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/payfast/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,
          plan_name: plan.name,
          amount: plan.price,
          frequency: 3 // 3 months recurring
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.payment_url) {
        // Redirect to PayFast payment page
        window.location.href = data.payment_url;
      } else {
        alert(data.error || 'Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const getFeatureLimitText = (plan: Plan) => {
    if (plan.id === 'business') return 'Unlimited';
    if (plan.id === 'pro') return '25,000/month';
    if (plan.id === 'starter') return '5,000/month';
    return '500/month';
  };

  const getAgentLimitText = (plan: Plan) => {
    if (plan.id === 'business') return 'Unlimited';
    if (plan.id === 'pro') return '10 agents';
    if (plan.id === 'starter') return '3 agents';
    return '1 agent';
  };

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
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-gray-300">Upgrade to unlock more features. Secure payments via PayFast.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border relative ${
                plan.popular ? 'border-orange-500 ring-2 ring-orange-500/50' : 'border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </div>
              )}
              
              <h2 className="text-xl font-bold text-white mb-2">{plan.name}</h2>
              <div className="mb-4">
                <span className="text-3xl font-bold text-orange-400">R{plan.price}</span>
                <span className="text-gray-400">/month</span>
              </div>
              
              <div className="mb-4 pb-4 border-b border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Messages</span>
                  <span className="text-white font-medium">{getFeatureLimitText(plan)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Agents</span>
                  <span className="text-white font-medium">{getAgentLimitText(plan)}</span>
                </div>
              </div>
              
              <ul className="space-y-2 mb-6">
                {plan.features.slice(0, 6).map((feature, idx) => (
                  <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    {feature}
                  </li>
                ))}
                {plan.features.length > 6 && (
                  <li className="text-gray-500 text-sm">+{plan.features.length - 6} more features</li>
                )}
              </ul>
              
              {plan.id === 'free' ? (
                <div className="w-full bg-gray-500/20 text-gray-400 text-center py-2 rounded-lg">
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading === plan.id ? 'Redirecting to PayFast...' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white/5 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">
            All plans include a 14-day free trial. Cancel anytime. Secure payments via PayFast. Rands only, no hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
}