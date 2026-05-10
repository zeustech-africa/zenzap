'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface QualityRating {
  phoneNumber: string;
  rating: 'green' | 'yellow' | 'red';
  qualityScore: number;
  status: 'connected' | 'flagged' | 'restricted';
  dailyMessageLimit: number;
  messagesSentToday: number;
  messagesRemaining: number;
  metrics: {
    conversionRate: number;
    responseTime: number;
    customerSatisfaction: number;
    complaintRate: number;
  };
  recommendations: string[];
  lastUpdated: string;
}

export default function QualityDashboardPage() {
  const [quality, setQuality] = useState<QualityRating | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQualityStatus();
  }, []);

  const fetchQualityStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/quality');
      const data = await response.json();
      setQuality(data);
    } catch (error) {
      console.error('Failed to fetch quality status:', error);
      // Mock data for development
      setQuality({
        phoneNumber: '+27 73 930 4732',
        rating: 'green',
        qualityScore: 98,
        status: 'connected',
        dailyMessageLimit: 1000,
        messagesSentToday: 342,
        messagesRemaining: 658,
        metrics: {
          conversionRate: 12.5,
          responseTime: 4.2,
          customerSatisfaction: 94,
          complaintRate: 1.2
        },
        recommendations: [
          'Your quality rating is excellent! Keep up the good work.',
          'Respond to customers within 5 minutes to maintain high satisfaction.',
          'Avoid sending promotional messages to unsubscribed users.'
        ],
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'red': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRatingBg = (rating: string) => {
    switch (rating) {
      case 'green': return 'bg-green-500/20 border-green-500/50';
      case 'yellow': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'red': return 'bg-red-500/20 border-red-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      case 'red': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading quality status...</div>
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
          <span className="text-white font-bold ml-4">Quality Rating</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Main Rating Card */}
        <div className={`rounded-2xl p-8 mb-6 border-2 ${getRatingBg(quality?.rating || 'green')}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-6xl mb-2">{getRatingIcon(quality?.rating || 'green')}</div>
              <h1 className="text-3xl font-bold text-white">
                {quality?.rating === 'green' ? 'High Quality' : quality?.rating === 'yellow' ? 'Medium Quality' : 'Low Quality'}
              </h1>
              <p className="text-gray-300 mt-1">Quality Score: {quality?.qualityScore}/100</p>
              <p className="text-gray-400 text-sm mt-2">Phone: {quality?.phoneNumber}</p>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${getRatingColor(quality?.rating || 'green')}`}>
                {quality?.qualityScore}%
              </div>
              <div className="text-gray-400 text-sm mt-1">Quality Score</div>
              <div className={`mt-2 px-3 py-1 rounded-full text-sm ${getRatingBg(quality?.rating || 'green')} text-white`}>
                {quality?.status === 'connected' ? '✅ Connected' : quality?.status === 'flagged' ? '⚠️ Flagged' : '🔒 Restricted'}
              </div>
            </div>
          </div>
        </div>

        {/* Message Limits */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-bold mb-4">📊 Message Limits</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{quality?.dailyMessageLimit.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Daily Limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{quality?.messagesSentToday.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Sent Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{quality?.messagesRemaining.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Remaining</div>
            </div>
          </div>
          <div className="mt-4 bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-orange-500 h-full rounded-full transition-all"
              style={{ width: `${(quality?.messagesSentToday || 0) / (quality?.dailyMessageLimit || 1) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-bold mb-4">📈 Performance Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{quality?.metrics.conversionRate}%</div>
              <div className="text-gray-400 text-sm">Conversion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{quality?.metrics.responseTime} min</div>
              <div className="text-gray-400 text-sm">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{quality?.metrics.customerSatisfaction}%</div>
              <div className="text-gray-400 text-sm">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{quality?.metrics.complaintRate}%</div>
              <div className="text-gray-400 text-sm">Complaint Rate</div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-white font-bold mb-4">💡 Recommendations</h2>
          <ul className="space-y-3">
            {quality?.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-300">
                <span className="text-orange-400">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-white/10 text-gray-500 text-xs">
            Last updated: {quality ? new Date(quality.lastUpdated).toLocaleString() : 'Never'}
          </div>
        </div>

        {/* What the ratings mean */}
        <div className="mt-8 bg-gray-800/50 rounded-xl p-4">
          <h3 className="text-white text-sm font-semibold mb-2">📖 What the ratings mean:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-green-400">🟢 Green</span>
              <span className="text-gray-400">High quality. You can send up to {quality?.dailyMessageLimit.toLocaleString()} messages/day.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">🟡 Yellow</span>
              <span className="text-gray-400">Medium quality. Message limit may be reduced.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">🔴 Red</span>
              <span className="text-gray-400">Low quality. Your number may be restricted.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}