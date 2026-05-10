'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OptInRecord {
  id: string;
  customerPhone: string;
  customerName?: string;
  optInSource: string;
  optInDate: string;
  marketingConsent: boolean;
  transactionalConsent: boolean;
  lastUpdated: string;
  notes?: string;
}

interface OptInLog {
  id: string;
  customerPhone: string;
  action: string;
  source: string;
  timestamp: string;
}

export default function OptInPage() {
  const [records, setRecords] = useState<OptInRecord[]>([]);
  const [logs, setLogs] = useState<OptInLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const [recordsRes, logsRes] = await Promise.all([
        fetch(`/api/optin/records?userId=${userId}`),
        fetch(`/api/optin/logs?userId=${userId}`)
      ]);
      
      const recordsData = await recordsRes.json();
      const logsData = await logsRes.json();
      
      setRecords(recordsData);
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to fetch opt-in data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConsent = async (phone: string, currentConsent: boolean) => {
    if (!confirm(currentConsent ? 'Remove marketing consent for this customer?' : 'Grant marketing consent for this customer?')) return;
    
    try {
      const userId = localStorage.getItem('userId');
      
      if (currentConsent) {
        // Opt out
        await fetch(`/api/optin/opt-out/${phone}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, source: 'manual', performedBy: 'admin' })
        });
      } else {
        // Opt in
        await fetch('/api/optin/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            customerPhone: phone,
            optInSource: 'manual',
            optInMethod: 'manual',
            marketingConsent: true,
            transactionalConsent: true
          })
        });
      }
      
      await fetchData();
    } catch (error) {
      alert('Failed to update consent');
    }
  };

  const filteredRecords = records.filter(r => 
    r.customerPhone.includes(searchTerm) || 
    (r.customerName && r.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading opt-in records...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Opt-in Management</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">📋 Marketing Consent Management</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
            >
              {showLogs ? 'Show Records' : 'View Audit Log'}
            </button>
          </div>
        </div>

        {/* Counter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{records.length}</div>
            <div className="text-gray-400 text-sm">Total Customers</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{records.filter(r => r.marketingConsent).length}</div>
            <div className="text-gray-400 text-sm">Marketing Consent</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{records.filter(r => !r.marketingConsent && r.transactionalConsent).length}</div>
            <div className="text-gray-400 text-sm">Transactional Only</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by phone or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
          />
        </div>

        {!showLogs ? (
          /* Records Table */
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-gray-300">Customer</th>
                    <th className="text-left p-4 text-gray-300">Phone</th>
                    <th className="text-left p-4 text-gray-300">Marketing Consent</th>
                    <th className="text-left p-4 text-gray-300">Transactional</th>
                    <th className="text-left p-4 text-gray-300">Source</th>
                    <th className="text-left p-4 text-gray-300">Date</th>
                    <th className="text-left p-4 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="p-4 text-white">{record.customerName || '—'}</td>
                      <td className="p-4 text-gray-300">{record.customerPhone}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${record.marketingConsent ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {record.marketingConsent ? 'Opted In' : 'Opted Out'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${record.transactionalConsent ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {record.transactionalConsent ? 'Allowed' : 'Blocked'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{record.optInSource}</td>
                      <td className="p-4 text-gray-400 text-sm">{new Date(record.optInDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleConsent(record.customerPhone, record.marketingConsent)}
                          className={`px-3 py-1 rounded text-sm transition ${
                            record.marketingConsent
                              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                              : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                          }`}
                        >
                          {record.marketingConsent ? 'Revoke Consent' : 'Grant Consent'}
                        </button>
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Audit Logs Table */
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-gray-300">Customer</th>
                    <th className="text-left p-4 text-gray-300">Action</th>
                    <th className="text-left p-4 text-gray-300">Source</th>
                    <th className="text-left p-4 text-gray-300">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="p-4 text-white">{log.customerPhone}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          log.action === 'opt_in' ? 'bg-green-500/20 text-green-400' :
                          log.action === 'opt_out' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {log.action}
                        </span>
                       </td>
                      <td className="p-4 text-gray-400 text-sm">{log.source}</td>
                      <td className="p-4 text-gray-400 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredRecords.length === 0 && !showLogs && (
          <div className="text-center py-12 text-gray-400">
            No opt-in records yet. When customers give consent, they'll appear here.
          </div>
        )}

        {/* Compliance Info */}
        <div className="mt-6 bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-blue-400 font-semibold mb-2">📋 Why Opt-in Management Matters</h3>
          <p className="text-gray-300 text-sm">
            • You can only send marketing messages to customers who have given consent
            • Keep audit logs for compliance with POPIA and WhatsApp policies
            • Customers can opt out anytime
            • Transactional messages (order updates, appointments) are always allowed
          </p>
        </div>
      </div>
    </div>
  );
}