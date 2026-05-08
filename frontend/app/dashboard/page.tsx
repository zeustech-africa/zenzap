'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TutorialTooltip from '../components/TutorialTooltip';
import HoverTooltip from '../components/HoverTooltip';

interface DashboardStats {
  messagesThisWeek: number;
  messageChange: number;
  leadsThisWeek: number;
  leadsChange: number;
  autoReplies: number;
  hoursSaved: number;
}

interface RecentMessage {
  id: string;
  phone: string;
  message: string;
  timestamp: string;
  fromAdmin: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    messagesThisWeek: 0,
    messageChange: 0,
    leadsThisWeek: 0,
    leadsChange: 0,
    autoReplies: 0,
    hoursSaved: 0
  });
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setLoading(false);
          return;
        }

        const [statsRes, recentRes] = await Promise.all([
          fetch(`/api/dashboard/stats/${userId}`),
          fetch(`/api/dashboard/recent/${userId}?limit=5`)
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          setRecentMessages(recentData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/images/zenzap-logo-icon.png" alt="ZENZAP" className="h-8 w-8" />
            <span className="text-white font-bold">ZENZAP Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">Free Plan</span>
            <Link href="/dashboard/settings" className="text-gray-300 hover:text-white text-sm transition">
              ⚙️ Account
            </Link>
            <Link href="/dashboard/subscription" className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-3 py-1 rounded-lg text-sm transition">
              Upgrade
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/login');
              }}
              className="text-red-400 hover:text-red-300 text-sm transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            onClick={() => router.push('/dashboard/inbox')}
            className="cursor-pointer hover:scale-105 transition bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center"
          >
            <div className="text-4xl mb-2">💬</div>
            <div className="text-3xl font-bold text-white">{stats.messagesThisWeek}</div>
            <div className="text-gray-300 text-sm">Messages This Week</div>
            <div className={`text-sm ${stats.messageChange >= 0 ? 'text-green-400' : 'text-red-400'} mt-1`}>
              {stats.messageChange >= 0 ? '↑' : '↓'} {Math.abs(stats.messageChange)}% from last week
            </div>
          </div>
          <div
            onClick={() => router.push('/dashboard/leads')}
            className="cursor-pointer hover:scale-105 transition bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center"
          >
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-white">{stats.leadsThisWeek}</div>
            <div className="text-gray-300 text-sm">Leads Captured</div>
            <div className={`text-sm ${stats.leadsChange >= 0 ? 'text-green-400' : 'text-red-400'} mt-1`}>
              {stats.leadsChange >= 0 ? '↑' : '↓'} {Math.abs(stats.leadsChange)}% from last week
            </div>
          </div>
          <div
            onClick={() => router.push('/dashboard/auto-replies')}
            className="cursor-pointer hover:scale-105 transition bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-center"
          >
            <div className="text-4xl mb-2">🤖</div>
            <div className="text-3xl font-bold text-white">{stats.autoReplies}</div>
            <div className="text-gray-300 text-sm">Automated Replies</div>
            <div className="text-gray-400 text-sm mt-1">Saved {stats.hoursSaved}+ hours</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-white font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <HoverTooltip text="View and reply to customer messages">
                <Link href="/dashboard/inbox" className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition">
                  💬 Message Inbox
                </Link>
              </HoverTooltip>
              <HoverTooltip text="Send one message to many customers at once">
                <Link href="/dashboard/broadcast" className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition">
                  📢 Send Broadcast
                </Link>
              </HoverTooltip>
              <HoverTooltip text="Manage your customer list with notes and tags">
                <Link href="/dashboard/contacts" className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition">
                  👥 Contacts
                </Link>
              </HoverTooltip>
              <HoverTooltip text="Import contacts in bulk from CSV or Excel">
                <Link href="/dashboard/import" className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition">
                  📥 Bulk Import Contacts
                </Link>
              </HoverTooltip>
              <HoverTooltip text="Set automatic answers for common questions like pricing or hours">
                <Link href="/dashboard/auto-replies" className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition">
                  🤖 Auto-Replies
                </Link>
              </HoverTooltip>
              <HoverTooltip text="Choose from pre-built message templates for your industry">
                <Link href="/dashboard/templates" className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition">
                  🎨 Industry Templates
                </Link>
              </HoverTooltip>
              <HoverTooltip text="Manage customer appointments and send reminders">
                <Link href="/dashboard/booking" className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition">
                  📅 Appointment Booking
                </Link>
              </HoverTooltip>
              <HoverTooltip text="Track potential customers and convert them into sales">
                <Link href="/dashboard/leads" className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition">
                  🎯 Lead Management
                </Link>
              </HoverTooltip>
              <HoverTooltip text="Full customer relationship management with history and notes">
                <Link href="/dashboard/crm" className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition">
                  👥 Customer CRM
                </Link>
              </HoverTooltip>
              <HoverTooltip text="Manage your plan, billing, and payment methods">
                <Link href="/dashboard/subscription" className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition">
                  💳 Subscription & Billing
                </Link>
              </HoverTooltip>
              <HoverTooltip text="View detailed analytics and performance metrics">
                <Link href="/dashboard/analytics" className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition">
                  📊 Analytics Dashboard
                </Link>
              </HoverTooltip>
              <HoverTooltip text="Configure your account, notifications, and preferences">
                <Link href="/dashboard/settings" className="block w-full text-left px-4 py-2 bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition">
                  ⚙️ Settings
                </Link>
              </HoverTooltip>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h2 className="text-white font-bold mb-4">Recent Conversations</h2>
            {recentMessages.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-4">
                No conversations yet. Start chatting with your customers!
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex justify-between items-center">
                    <div>
                      <div className="text-white text-sm">{msg.phone}</div>
                      <div className="text-gray-400 text-xs truncate max-w-[200px]">{msg.message}</div>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link href="/dashboard/inbox" className="text-orange-400 text-sm mt-4 inline-block">
              View all conversations →
            </Link>
          </div>
        </div>

        {/* Setup Complete Message */}
        <div className="mt-8 bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
          <p className="text-green-300 text-sm">
            ✅ Your ZENZAP is fully configured! You're ready to start automating.
          </p>
        </div>
      </div>

      <TutorialTooltip />
    </div>
  );
}