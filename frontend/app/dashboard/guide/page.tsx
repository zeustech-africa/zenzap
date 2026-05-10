'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  steps?: string[];
  tips?: string[];
}

export default function UserGuidePage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      content: 'Welcome to ZENZAP! This guide will help you set up and use all the features.',
      steps: [
        'Complete your business profile in Settings',
        'Connect your WhatsApp Business number',
        'Choose an industry template or set up custom auto-replies',
        'Start automating your customer conversations'
      ]
    },
    {
      id: 'connect-whatsapp',
      title: 'Connect WhatsApp',
      icon: '💬',
      content: 'Connect your WhatsApp Business account to ZENZAP in 30 seconds.',
      steps: [
        'Go to Settings → Connect WhatsApp',
        'Scan the QR code with your WhatsApp Business app',
        'Tap "Link a Device"',
        'Your WhatsApp is now connected!'
      ],
      tips: [
        'Keep your WhatsApp Business app updated',
        'You can use WhatsApp app and ZENZAP simultaneously',
        'One number can only be connected to one device at a time'
      ]
    },
    {
      id: 'auto-replies',
      title: 'Auto-Replies',
      icon: '🤖',
      content: 'Set up automatic responses when customers message specific keywords.',
      steps: [
        'Go to Dashboard → Auto-Replies',
        'Click "Add New Rule"',
        'Enter a keyword (e.g., "price", "hours", "booking")',
        'Enter your automatic response message',
        'Save and enable the rule'
      ],
      tips: [
        'Start with 5 common keywords: price, hours, location, booking, delivery',
        'Keep responses short and helpful',
        'Test your auto-replies by sending a message from another phone'
      ]
    },
    {
      id: 'industry-templates',
      title: 'Industry Templates',
      icon: '🎨',
      content: 'Get started faster with pre-configured templates for your business type.',
      steps: [
        'Go to Dashboard → Industry Templates',
        'Choose your business type (Salon, Restaurant, Real Estate, Retail, Healthcare)',
        'Click "Activate Template"',
        'Customize the auto-replies and settings as needed'
      ],
      tips: [
        'Templates include pre-built auto-replies for common customer questions',
        'You can modify any template after activation',
        'Different templates work better for different industries'
      ]
    },
    {
      id: 'booking-system',
      title: 'Appointment Booking',
      icon: '📅',
      content: 'Let customers book appointments automatically via WhatsApp.',
      steps: [
        'Go to Dashboard → Appointment Booking',
        'Set your available time slots',
        'Set appointment duration',
        'Customers can say "book appointment" to start booking',
        'View and manage appointments in the booking dashboard'
      ],
      tips: [
        'Set reminders to reduce no-shows',
        'Block time for lunch breaks',
        'Sync with your calendar for better management'
      ]
    },
    {
      id: 'lead-capture',
      title: 'Lead Management',
      icon: '🎯',
      content: 'Capture and track potential customers automatically.',
      steps: [
        'Go to Dashboard → Lead Management',
        'Leads are automatically captured when customers express interest',
        'Update lead status as you contact them',
        'Add notes to track conversations'
      ],
      tips: [
        'Follow up with leads within 24 hours',
        'Use tags to categorize leads',
        'Track conversion rates in Analytics'
      ]
    },
    {
      id: 'crm',
      title: 'Customer CRM',
      icon: '👥',
      content: 'Manage all your customer contacts in one place.',
      steps: [
        'Go to Dashboard → Customer CRM',
        'View all customers who messaged you',
        'Add tags and notes to customers',
        'Search by name, phone, or email'
      ],
      tips: [
        'Add notes about customer preferences',
        'Tag VIP customers for special treatment',
        'Export contacts for marketing campaigns'
      ]
    },
    {
      id: 'ai-features',
      title: 'AI Features',
      icon: '🧠',
      content: 'Use AI to reply faster and smarter.',
      steps: [
        'Go to Message Inbox',
        'When you receive a message, AI will suggest replies',
        'Click on a suggestion to use it',
        'AI learns from your responses over time'
      ],
      tips: [
        'AI works best with common customer questions',
        'You can always edit suggested replies before sending',
        'The more you use it, the better it gets'
      ]
    },
    {
      id: 'broadcast',
      title: 'Broadcast Messages',
      icon: '📢',
      content: 'Send messages to multiple customers at once.',
      steps: [
        'Go to Dashboard → Send Broadcast',
        'Choose your audience (All, Active, Leads)',
        'Write your message',
        'Review and send'
      ],
      tips: [
        'Personalize messages with customer names',
        'Don\'t spam - send only relevant information',
        'Use broadcasts for promotions and announcements'
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: '📊',
      content: 'Track your performance and customer engagement.',
      steps: [
        'Go to Dashboard → Analytics Dashboard',
        'View message volume and response times',
        'Track lead conversion rates',
        'Monitor revenue and subscription status'
      ],
      tips: [
        'Check analytics weekly to spot trends',
        'Low response times lead to happier customers',
        'Use data to improve your customer service'
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      content: 'Common issues and how to fix them.',
      steps: [
        'QR code not scanning? Refresh the page and try again',
        'Not receiving messages? Check your WhatsApp Business app is active',
        'Can\'t send broadcasts? Verify your subscription plan',
        'Auto-replies not working? Check keywords are correct',
        'Connection issues? Disconnect and reconnect WhatsApp'
      ]
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: '❓',
      content: 'Frequently asked questions.',
      steps: [
        'Q: How much does ZENZAP cost? A: Plans start at R299/month',
        'Q: Can I use my regular WhatsApp? A: No, you need WhatsApp Business',
        'Q: Is there a free trial? A: Yes, 14 days free',
        'Q: Can I cancel anytime? A: Yes, no contracts',
        'Q: Do I need technical skills? A: No, ZENZAP is designed to be simple'
      ]
    }
  ];

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
              ← Dashboard
            </Link>
            <span className="text-white font-bold ml-4">User Guide</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
            <h2 className="text-white font-bold mb-4 pb-2 border-b border-white/20">Guide Sections</h2>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                    activeSection === section.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span className="text-sm">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            {activeContent && (
              <>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
                  <span className="text-4xl">{activeContent.icon}</span>
                  <h1 className="text-2xl font-bold text-white">{activeContent.title}</h1>
                </div>
                
                <p className="text-gray-300 mb-6">{activeContent.content}</p>
                
                {activeContent.steps && (
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">📋 Step-by-Step Guide:</h3>
                    <ol className="space-y-2">
                      {activeContent.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <span className="text-orange-400 font-bold">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {activeContent.tips && (
                  <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
                    <h3 className="text-orange-400 font-semibold mb-2">💡 Pro Tips:</h3>
                    <ul className="space-y-1">
                      {activeContent.tips.map((tip, idx) => (
                        <li key={idx} className="text-gray-300 text-sm">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}