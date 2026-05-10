'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ShopifyStore {
  storeName: string;
  storeUrl: string;
  isConnected: boolean;
  lastSyncAt?: string;
}

interface ShopifyOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  totalPrice: number;
  currency: string;
  status: string;
  createdAt: string;
  items: { productName: string; quantity: number; price: number }[];
}

export default function ShopifyPage() {
  const [store, setStore] = useState<ShopifyStore | null>(null);
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [shopDomain, setShopDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'store' | 'orders'>('store');

  useEffect(() => {
    fetchStatus();
    fetchOrders();
  }, []);

  const fetchStatus = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/shopify/status?userId=${userId}`);
      const data = await response.json();
      setStore(data.store);
    } catch (error) {
      console.error('Failed to fetch Shopify status:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/shopify/orders?userId=${userId}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch Shopify orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectShopify = async () => {
    if (!shopDomain) {
      alert('Please enter your Shopify store domain');
      return;
    }
    
    setConnecting(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/shopify/auth-url?userId=${userId}&shop=${shopDomain}`);
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      alert('Failed to connect Shopify');
      setConnecting(false);
    }
  };

  const disconnectShopify = async () => {
    if (!confirm('Disconnect Shopify store? Your products will remain in catalog but will not sync.')) return;
    
    try {
      const userId = localStorage.getItem('userId');
      await fetch(`/api/shopify/disconnect?userId=${userId}`, { method: 'DELETE' });
      setStore(null);
    } catch (error) {
      alert('Failed to disconnect');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading Shopify integration...</div>
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
          <span className="text-white font-bold ml-4">Shopify Integration</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Connection Status */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
          {store?.isConnected ? (
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white font-semibold">Connected to {store.storeName}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">Store: {store.storeUrl}</p>
                {store.lastSyncAt && (
                  <p className="text-gray-500 text-xs mt-1">Last sync: {new Date(store.lastSyncAt).toLocaleString()}</p>
                )}
              </div>
              <button
                onClick={disconnectShopify}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-4">🛍️</div>
              <h2 className="text-xl font-bold text-white mb-2">Connect Shopify Store</h2>
              <p className="text-gray-400 mb-4">Sync your products and orders to WhatsApp</p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="your-store.myshopify.com"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
                <button
                  onClick={connectShopify}
                  disabled={connecting}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-4">Enter your Shopify store domain (e.g., mystore.myshopify.com)</p>
            </div>
          )}
        </div>

        {store?.isConnected && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab('store')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'store'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📦 Products & Sync
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'orders'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🛒 Orders ({orders.length})
              </button>
            </div>

            {/* Products Tab */}
            {activeTab === 'store' && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-white font-bold">Product Sync</h2>
                  <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1 rounded text-sm transition">
                    Sync Now
                  </button>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Products from your Shopify store are automatically synced to your WhatsApp catalog.
                </p>
                <Link
                  href="/dashboard/catalog"
                  className="inline-block text-orange-400 hover:text-orange-300 text-sm"
                >
                  View Products in Catalog →
                </Link>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
                <div className="divide-y divide-white/10">
                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      No orders synced yet. When customers place orders, they'll appear here.
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="p-4 hover:bg-white/5">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">#{order.orderNumber}</span>
                              <span className="text-gray-400 text-sm">{order.customerName}</span>
                            </div>
                            <div className="text-gray-400 text-sm mt-1">
                              Items: {order.items.map(i => `${i.productName} x${i.quantity}`).join(', ')}
                            </div>
                            <div className="text-orange-400 font-bold mt-1">R{order.totalPrice.toFixed(2)}</div>
                            <div className="text-gray-500 text-xs mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                          </div>
                          <button className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded text-sm transition">
                            Send WhatsApp
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* How It Works */}
        <div className="mt-8 bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-blue-400 font-semibold mb-2">💡 How Shopify Integration Works</h3>
          <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
            <li>Connect your Shopify store with one click</li>
            <li>Products automatically sync to your WhatsApp catalog</li>
            <li>New orders appear in ZENZAP for WhatsApp notifications</li>
            <li>Send order updates and abandoned cart reminders via WhatsApp</li>
          </ul>
        </div>
      </div>
    </div>
  );
}