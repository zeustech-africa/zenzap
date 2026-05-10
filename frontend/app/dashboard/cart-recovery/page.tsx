'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AbandonedCart {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { productName: string; quantity: number; price: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
  discountCode?: string;
}

interface Stats {
  total: number;
  recovered: number;
  lost: number;
  pending: number;
  recoveryRate: string;
  potentialRevenue: number;
}

export default function CartRecoveryPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const [cartsRes, statsRes] = await Promise.all([
        fetch(`/api/cart/abandoned?userId=${userId}`),
        fetch(`/api/cart/stats?userId=${userId}`)
      ]);

      const cartsData = await cartsRes.json();
      const statsData = await statsRes.json();

      setCarts(cartsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch cart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendManualReminder = async (cart: AbandonedCart) => {
    const message = `🛒 Hi ${cart.customerName}, you left items in your cart!\n\nItems: ${cart.items.map(i => `${i.productName} x${i.quantity}`).join(', ')}\nTotal: R${cart.totalAmount.toFixed(2)}\n\nComplete your purchase here.`;

    window.open(`https://wa.me/${cart.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recovered': return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Recovered</span>;
      case 'reminder_sent_1': return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Reminder 1 Sent</span>;
      case 'reminder_sent_2': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Reminder 2 Sent</span>;
      case 'reminder_sent_3': return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">Reminder 3 Sent</span>;
      default: return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">New</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading cart recovery...</div>
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
          <span className="text-white font-bold ml-4">Cart Recovery</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats?.total || 0}</div>
            <div className="text-gray-400 text-sm">Abandoned Carts</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats?.recovered || 0}</div>
            <div className="text-gray-400 text-sm">Recovered</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats?.recoveryRate || 0}%</div>
            <div className="text-gray-400 text-sm">Recovery Rate</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">R{stats?.potentialRevenue?.toLocaleString() || 0}</div>
            <div className="text-gray-400 text-sm">Potential Revenue</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats?.pending || 0}</div>
            <div className="text-gray-400 text-sm">Pending Recovery</div>
          </div>
        </div>

        {/* Abandoned Carts List */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="p-4 border-b border-white/20">
            <h2 className="text-white font-bold">🛒 Abandoned Carts</h2>
            <p className="text-gray-400 text-sm">Customers who added items but didn't complete checkout</p>
          </div>
          <div className="divide-y divide-white/10">
            {carts.map((cart) => (
              <div key={cart.id} className="p-4 hover:bg-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{cart.customerName}</span>
                      {getStatusBadge(cart.status)}
                    </div>
                    <div className="text-gray-400 text-sm mt-1">{cart.customerPhone}</div>
                    <div className="text-gray-300 text-sm mt-2">
                      Items: {cart.items.map(i => `${i.productName} x${i.quantity}`).join(', ')}
                    </div>
                    <div className="text-orange-400 font-bold mt-1">R{cart.totalAmount.toFixed(2)}</div>
                    {cart.discountCode && (
                      <div className="text-green-400 text-sm mt-1">🎉 Discount: {cart.discountCode}</div>
                    )}
                    <div className="text-gray-500 text-xs mt-1">Abandoned: {new Date(cart.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    {cart.status !== 'recovered' && (
                      <button
                        onClick={() => sendManualReminder(cart)}
                        className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-3 py-1 rounded text-sm transition"
                      >
                        Send Reminder
                      </button>
                    )}
                    {cart.status === 'recovered' && (
                      <span className="text-green-400 text-sm">✅ Recovered</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {carts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No abandoned carts yet. When customers leave items in cart, they'll appear here.
          </div>
        )}

        {/* How It Works */}
        <div className="mt-8 bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-blue-400 font-semibold mb-2">💡 How Cart Recovery Works</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• When a customer adds items to cart but doesn't checkout, we track it</li>
            <li>• Automatic WhatsApp reminders after 1 hour, 6 hours, and 24 hours</li>
            <li>• Second reminder includes 10% discount code</li>
            <li>• Third reminder includes 15% discount code</li>
            <li>• You can also send manual reminders anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}