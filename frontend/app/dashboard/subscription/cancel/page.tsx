'use client';

import Link from 'next/link';

export default function SubscriptionCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md text-center border border-white/20">
        <div className="text-6xl mb-4">😔</div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-gray-300 mb-4">
          Your subscription was not activated. You can try again anytime.
        </p>
        <Link
          href="/dashboard/subscription"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition"
        >
          Back to Plans
        </Link>
      </div>
    </div>
  );
}