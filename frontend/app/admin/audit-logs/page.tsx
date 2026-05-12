'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchLogs();
  }, [router]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('approve')) return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Approve</span>;
    if (action.includes('delete')) return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">Delete</span>;
    if (action.includes('broadcast')) return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">Broadcast</span>;
    return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs">{action}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-gray-400">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Audit Logs</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <h2 className="text-white font-bold mb-4">Admin Activity Log</h2>
          
          {logs.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No activity logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-3 text-gray-300">Time</th>
                    <th className="text-left p-3 text-gray-300">Admin</th>
                    <th className="text-left p-3 text-gray-300">Action</th>
                    <th className="text-left p-3 text-gray-300">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-white/10">
                      <td className="p-3 text-gray-400 text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 text-gray-300">{log.adminEmail}</td>
                      <td className="p-3">{getActionBadge(log.action)}</td>
                      <td className="p-3 text-gray-400 text-sm">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}