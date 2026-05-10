'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PaymentLink {
  id: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  description: string;
  status: 'pending' | 'paid' | 'expired';
  createdAt: string;
  expiresAt: string;
  shortLink: string;
}

export default function PaymentsPage() {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    amount: '',
    description: ''
  });
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/payments/links?userId=${userId}`);
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error('Failed to fetch payment links:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPaymentLink = async () => {
    if (!formData.customerName || !formData.customerPhone || !formData.amount) {
      alert('Please fill in customer name, phone, and amount');
      return;
    }
    
    setCreating(true);
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowForm(false);
        setFormData({ customerName: '', customerEmail: '', customerPhone: '', amount: '', description: '' });
        await fetchLinks();
        
        // Ask if user wants to send link via WhatsApp
        if (confirm('Payment link created! Send it to your customer via WhatsApp?')) {
          window.open(`https://wa.me/${formData.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Please complete your payment of R${formData.amount} using this link: ${data.shortLink}`)}`, '_blank');
        }
      } else {
        alert('Failed to create payment link');
      }
    } catch (error) {
      alert('Error creating payment link');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Paid</span>;
      case 'expired': return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Expired</span>;
      default: return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading payment links...</div>
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
          <span className="text-white font-bold ml-4">Payment Links</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">💳 Payment Links</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            + Create Payment Link
          </button>
        </div>

        {/* Payment Links List */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300">Customer</th>
                  <th className="text-left p-4 text-gray-300">Amount</th>
                  <th className="text-left p-4 text-gray-300">Status</th>
                  <th className="text-left p-4 text-gray-300">Created</th>
                  <th className="text-left p-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div className="text-white">{link.customerName}</div>
                      <div className="text-gray-400 text-sm">{link.customerPhone}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-orange-400 font-bold">R{link.amount.toFixed(2)}</span>
                    </td>
                    <td className="p-4">{getStatusBadge(link.status)}</td>
                    <td className="p-4 text-gray-400 text-sm">{new Date(link.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyLink(link.shortLink, link.id)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          {copied === link.id ? 'Copied!' : 'Copy Link'}
                        </button>
                        <a
                          href={`https://wa.me/${link.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Please complete your payment: ${link.shortLink}`)}`}
                          target="_blank"
                          className="text-green-400 hover:text-green-300 text-sm"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {links.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No payment links yet. Create one to request payment from customers.
          </div>
        )}

        {/* Create Payment Link Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-md w-full p-6">
              <h2 className="text-white font-bold text-lg mb-4">Create Payment Link</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Customer Name *"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <input
                  type="tel"
                  placeholder="Customer WhatsApp Number * (e.g., 27721234567)"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <input
                  type="email"
                  placeholder="Customer Email (Optional)"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <input
                  type="number"
                  placeholder="Amount (R) *"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Description (e.g., Deposit for booking)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={createPaymentLink}
                  disabled={creating}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Link'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-4 text-center">
                Links expire after 48 hours. Customer will pay via PayFast (cards, instant EFT).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}