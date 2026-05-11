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
      content: 'Welcome to ZENZAP! ZENZAP is a complete WhatsApp Business automation platform designed for African businesses. This guide covers everything from basic setup to advanced integrations.',
      steps: [
        'Complete your business profile in Settings',
        'Connect your WhatsApp Business number via QR code',
        'Set up auto-replies for common customer questions',
        'Explore the dashboard to understand all features',
        'Upgrade your subscription plan to unlock more capabilities'
      ],
      tips: [
        'Start with the Free plan to explore basic features',
        'Use the 14-day free trial to test Pro features',
        'Bookmark this guide for quick reference'
      ]
    },
    {
      id: 'connect-whatsapp',
      title: 'Connect WhatsApp (QR Code)',
      icon: '📱',
      content: 'Connect your WhatsApp Business account to ZENZAP in under 30 seconds using QR code scanning.',
      steps: [
        'Go to Settings → Connect WhatsApp Business',
        'Open WhatsApp Business on your phone',
        'Go to Settings → Linked Devices → Link a Device',
        'Scan the QR code displayed on the ZENZAP screen',
        'Wait for the connection confirmation - you\'re now linked!'
      ],
      tips: [
        'Keep your WhatsApp Business app updated to the latest version',
        'One WhatsApp number can be linked to one ZENZAP account',
        'Your phone needs an active internet connection during scanning',
        'If the QR code expires, click "Refresh QR Code" to generate a new one'
      ]
    },
    {
      id: 'auto-replies',
      title: 'Using Auto-Replies',
      icon: '🤖',
      content: 'Auto-replies let you respond to customer messages automatically when they use specific trigger keywords. This saves time and ensures customers get instant responses 24/7.',
      steps: [
        'Navigate to Dashboard → Auto-Replies',
        'Click "Add New Rule" to create a trigger',
        'Enter the keyword that triggers the reply (e.g., "price", "hours", "booking")',
        'Write your automatic response message',
        'Toggle the rule ON to activate it',
        'Test by sending that keyword from another WhatsApp number'
      ],
      tips: [
        'Start with common keywords: price, hours, location, booking, delivery',
        'Free plan: up to 5 auto-reply rules. Upgrade for unlimited.',
        'Use friendly, conversational language in your replies',
        'Include emojis to make responses more engaging',
        'Review analytics to see which keywords customers use most'
      ]
    },
    {
      id: 'message-templates',
      title: 'Message Templates',
      icon: '📝',
      content: 'Message templates are pre-approved WhatsApp message formats used for sending notifications, marketing messages, and customer support replies that go beyond the 24-hour customer service window.',
      steps: [
        'Go to Dashboard → Templates',
        'Click "Create Template" to design a new message',
        'Choose template category (Marketing, Utility, or Authentication)',
        'Write your template with optional variables (e.g., {{customer_name}})',
        'Submit for WhatsApp approval (required for business-initiated messages)',
        'Use approved templates in broadcasts and automated flows'
      ],
      tips: [
        'Free plan: 3 templates. Business plan: unlimited templates',
        'Templates must follow WhatsApp\'s Commerce and Business policies',
        'Use {{variables}} to personalize messages for each customer',
        'Marketing templates have stricter approval criteria'
      ]
    },
    {
      id: 'quality-rating',
      title: 'Quality Rating',
      icon: '⭐',
      content: 'Quality Rating helps you monitor your WhatsApp Business account health. WhatsApp rates your phone number quality based on customer feedback, message blocks, and reports. A good quality rating ensures higher message delivery rates.',
      steps: [
        'Go to Dashboard → Quality Rating',
        'View your current quality score (Green, Yellow, or Red)',
        'Monitor message delivery rates and customer feedback',
        'Address negative signals promptly to maintain a good rating',
        'Check quality trends over time with historical data'
      ],
      tips: [
        'Available on Starter plan and above',
        'Respond to customer messages quickly to maintain quality',
        'Avoid sending spam or irrelevant messages',
        'High opt-out rates negatively affect your quality score',
        'Aim to keep your rating in the "Green" zone at all times'
      ]
    },
    {
      id: 'agent-performance',
      title: 'Agent Performance',
      icon: '📊',
      content: 'Track and improve your team\'s performance with detailed agent analytics. Monitor response times, resolution rates, customer satisfaction scores, and workload distribution.',
      steps: [
        'Go to Dashboard → Agent Performance',
        'Add team members as agents in your ZENZAP account',
        'Assign conversations to agents in the Inbox',
        'Review response time metrics and resolution rates',
        'Use the data to coach agents and improve service quality'
      ],
      tips: [
        'Available on Starter plan and above',
        'Set response time targets for your team',
        'Use performance data for agent training and development',
        'Monitor workload distribution to prevent burnout',
        'Celebrate top performers to motivate the team'
      ]
    },
    {
      id: 'coexistence-mode',
      title: 'Coexistence Mode',
      icon: '🔄',
      content: 'Coexistence Mode allows you to use ZENZAP alongside the WhatsApp Business app simultaneously. Multiple agents can access the same WhatsApp number without logging each other out.',
      steps: [
        'Go to Dashboard → Coexistence Mode',
        'Enable coexistence in the settings panel',
        'Add team members who need access to the WhatsApp number',
        'Set role-based permissions for each agent',
        'All agents can now send/receive messages from the same number'
      ],
      tips: [
        'Available on Business plan only',
        'Essential for teams handling customer support together',
        'Set clear handoff protocols between agents',
        'Monitor who sent which message with audit trails',
        'Use tags to track conversation ownership'
      ]
    },
    {
      id: 'click-to-whatsapp',
      title: 'Click-to-WhatsApp Ads',
      icon: '📢',
      content: 'Create Click-to-WhatsApp ads that direct Facebook and Instagram users straight to your WhatsApp Business chat. Turn ad clicks into conversations and conversions.',
      steps: [
        'Go to Dashboard → Click-to-WhatsApp Ads',
        'Connect your Facebook Business account',
        'Create a new ad campaign targeting your audience',
        'Set your welcome message that customers see when they click',
        'Launch and track ad performance in the dashboard'
      ],
      tips: [
        'Use clear call-to-action buttons in your ads',
        'Set up auto-replies to handle ad-generated conversations',
        'Track conversion rates from ad clicks to sales',
        'A/B test different welcome messages for better engagement',
        'Retarget engaged users who clicked but didn\'t convert'
      ]
    },
    {
      id: 'nlu',
      title: 'Natural Language Understanding (AI)',
      icon: '🧠',
      content: 'ZENZAP\'s AI-powered Natural Language Understanding (NLU) interprets customer messages beyond simple keyword matching. The AI understands intent, context, and sentiment for smarter auto-replies.',
      steps: [
        'Go to Dashboard → NLU Settings',
        'Enable NLU-powered responses in your auto-reply settings',
        'Configure intents for common customer queries',
        'Train the AI by reviewing and correcting suggested responses',
        'Monitor NLU accuracy and improve over time'
      ],
      tips: [
        'Available on Pro plan and above',
        'NLU handles typos, slang, and variations automatically',
        'Review AI suggestions before they\'re sent (human-in-the-loop)',
        'The more you use NLU, the better it understands your business',
        'Combine NLU with auto-replies for 24/7 intelligent support'
      ]
    },
    {
      id: 'instagram-dms',
      title: 'Instagram Direct Messages',
      icon: '📷',
      content: 'Manage Instagram Direct Messages alongside WhatsApp chats in a single unified inbox. Respond to customers regardless of which platform they use.',
      steps: [
        'Go to Dashboard → Instagram Integration',
        'Connect your Instagram Business account',
        'Authorize ZENZAP to access your Instagram messages',
        'All incoming DMs appear in your unified inbox',
        'Reply directly from ZENZAP - no need to switch apps'
      ],
      tips: [
        'Available on Pro plan and above',
        'Use the same auto-reply rules for Instagram messages',
        'Track cross-platform customer journeys in analytics',
        'Instagram Story mentions can also trigger auto-replies',
        'Maintain consistent branding across WhatsApp and Instagram'
      ]
    },
    {
      id: 'product-catalog',
      title: 'Product Catalog',
      icon: '🛍️',
      content: 'Create and manage your product catalog directly on WhatsApp. Customers can browse products, check prices, and place orders without leaving the chat.',
      steps: [
        'Go to Dashboard → Catalog',
        'Add products with images, descriptions, and prices',
        'Organize products by category for easy browsing',
        'Share product links in customer conversations',
        'Customers can add products to cart and place orders via WhatsApp'
      ],
      tips: [
        'Free plan: 10 products. Business plan: unlimited products',
        'Use high-quality product images (1:1 ratio recommended)',
        'Keep product descriptions clear and concise',
        'Update prices and availability regularly',
        'Include product codes/SKUs for inventory tracking'
      ]
    },
    {
      id: 'payment-links',
      title: 'Payment Links',
      icon: '💳',
      content: 'Generate and send payment links directly in WhatsApp chats. Customers can pay securely via PayFast (credit cards, EFT, and more) without leaving the conversation.',
      steps: [
        'Go to Dashboard → Payment Links',
        'Create a payment link with amount, description, and reference',
        'Share the link in a WhatsApp conversation',
        'Customer clicks the link and completes payment on PayFast',
        'Receive payment confirmation and update order status'
      ],
      tips: [
        'Available on Pro plan and above',
        'Payments secure via PayFast (South Africa\'s leading gateway)',
        'Set expiry dates on payment links for time-sensitive offers',
        'Use payment links for deposits, invoices, and COD confirmations',
        'Integrate with your catalog for direct product purchases'
      ]
    },
    {
      id: 'abandoned-cart',
      title: 'Abandoned Cart Recovery',
      icon: '🛒',
      content: 'Automatically detect when customers add items to their cart but don\'t complete the purchase. Send personalized WhatsApp reminders to bring them back and recover lost sales.',
      steps: [
        'Go to Dashboard → Abandoned Cart Recovery',
        'Connect your e-commerce platform or use ZENZAP\'s catalog cart',
        'Set the time delay for sending recovery messages (e.g., 1 hour)',
        'Customize the recovery message template',
        'Track recovered revenue in the analytics dashboard'
      ],
      tips: [
        'Available on Pro plan and above',
        'Send the first reminder within 1-2 hours of abandonment',
        'Include a discount code to incentivize completion',
        'Follow up with a second reminder after 24 hours',
        'Monitor recovery rates to optimize your messaging strategy'
      ]
    },
    {
      id: 'webhooks',
      title: 'Webhooks (Connect to Zapier)',
      icon: '🔗',
      content: 'Use webhooks to connect ZENZAP with thousands of other apps via Zapier, Make (Integromat), or direct API. Automate workflows between ZENZAP and your CRM, email, spreadsheets, and more.',
      steps: [
        'Go to Dashboard → Webhooks',
        'Create a new webhook endpoint',
        'Select the event trigger (new message, new contact, payment received, etc.)',
        'Copy the webhook URL and configure it in Zapier or your app',
        'Test the webhook to verify data is flowing correctly'
      ],
      tips: [
        'Available on Pro plan and above',
        'Popular Zaps: Save contacts to Google Sheets, send email alerts, CRM sync',
        'Use webhooks to build custom integrations without coding',
        'Monitor webhook delivery logs for debugging',
        'Rate limits apply based on your subscription tier'
      ]
    },
    {
      id: 'opt-in-management',
      title: 'Opt-in Management',
      icon: '✅',
      content: 'Manage customer consent and opt-in preferences to stay compliant with WhatsApp policies. Collect, track, and honor opt-in/opt-out requests automatically.',
      steps: [
        'Go to Dashboard → Opt-in Management',
        'Set up opt-in flows for new customers (welcome message + consent)',
        'Configure opt-out keywords (e.g., "STOP", "UNSUBSCRIBE")',
        'View all opt-in/opt-out records in the dashboard',
        'Customers who opt out are automatically excluded from broadcasts'
      ],
      tips: [
        'Available on Business plan only',
        'WhatsApp requires explicit opt-in for marketing messages',
        'Keep records of all opt-ins for compliance audits',
        'Respect opt-out requests immediately to avoid penalties',
        'Use double opt-in for high-compliance industries'
      ]
    },
    {
      id: 'green-tick',
      title: 'Green Tick Verification Guide',
      icon: '✔️',
      content: 'The WhatsApp Green Tick (Official Business Account) builds trust with customers. ZENZAP provides a step-by-step guide to help you apply for and obtain the verified badge.',
      steps: [
        'Go to Dashboard → Green Tick Verification',
        'Review WhatsApp\'s eligibility requirements',
        'Ensure your business is registered and has an online presence',
        'Submit your application through Meta Business Manager',
        'ZENZAP provides tips for a successful application',
        'Once approved, your WhatsApp profile shows the green checkmark'
      ],
      tips: [
        'Available on Business plan only',
        'Notable businesses are more likely to be approved',
        'Maintain an active online presence (website, social media)',
        'Green tick improves message delivery rates and customer trust',
        'Re-apply if denied - ZENZAP helps you address rejection reasons'
      ]
    },
    {
      id: 'whatsapp-flows',
      title: 'WhatsApp Flows',
      icon: '↗️',
      content: 'WhatsApp Flows enable multi-step interactive experiences within WhatsApp. Create forms, surveys, booking flows, and lead capture sequences that customers complete without leaving chat.',
      steps: [
        'Go to Dashboard → WhatsApp Flows',
        'Create a new flow with interactive steps',
        'Add form fields, multiple choice questions, and confirmation screens',
        'Design the flow logic (branching based on customer responses)',
        'Share the flow link in conversations or set as auto-reply',
        'View flow completions and collected data in analytics'
      ],
      tips: [
        'Free plan: 1 flow. Business plan: unlimited flows',
        'Use flows for customer onboarding, surveys, and booking',
        'Keep flows short (3-5 steps) for best completion rates',
        'Test flows thoroughly on different devices before publishing',
        'Flows can capture structured data like names, dates, and preferences'
      ]
    },
    {
      id: 'shopify-integration',
      title: 'Shopify Integration',
      icon: '🏪',
      content: 'Connect ZENZAP to your Shopify store for seamless e-commerce automation. Sync products, send order updates, and provide customer support powered by your store data.',
      steps: [
        'Go to Dashboard → Shopify Integration',
        'Enter your Shopify store URL and API credentials',
        'Select which data to sync (products, orders, customers)',
        'Configure automated order confirmation and shipping update messages',
        'Manage Shopify customer inquiries from the ZENZAP inbox'
      ],
      tips: [
        'Available on Business plan only',
        'Automatically sync product catalog from Shopify',
        'Send personalized order status updates via WhatsApp',
        'Reduce "Where is my order?" support tickets',
        'Combine with abandoned cart recovery for maximum revenue'
      ]
    },
    {
      id: 'crm-integration',
      title: 'CRM Integration (HubSpot/Salesforce)',
      icon: '🔗',
      content: 'Sync ZENZAP conversations and contacts with HubSpot or Salesforce CRM. Every WhatsApp interaction is automatically logged in your CRM for a complete customer view.',
      steps: [
        'Go to Dashboard → CRM Integration',
        'Select your CRM platform (HubSpot or Salesforce)',
        'Authenticate with your CRM credentials',
        'Choose sync direction (bi-directional, ZENZAP→CRM, or CRM→ZENZAP)',
        'Map ZENZAP contact fields to CRM fields',
        'Conversations, tags, and notes sync automatically'
      ],
      tips: [
        'Available on Business plan only',
        'Bi-directional sync keeps both systems in perfect harmony',
        'Create CRM deals directly from WhatsApp conversations',
        'Use CRM data to personalize WhatsApp messages',
        'Sales teams can see full WhatsApp history in the CRM'
      ]
    },
    {
      id: 'whatsapp-calls',
      title: 'WhatsApp Voice/Video Calls',
      icon: '📞',
      content: 'Initiate and manage WhatsApp voice and video calls through ZENZAP. Log call details, outcomes, and follow-ups alongside your chat conversations.',
      steps: [
        'Go to Dashboard → Calls',
        'Initiate a WhatsApp call to a customer from their profile',
        'Log call details (duration, outcome, notes) directly in ZENZAP',
        'Schedule follow-up calls with reminders',
        'View call history alongside chat history for each customer'
      ],
      tips: [
        'Available on Business plan only',
        'Calls are placed through your WhatsApp Business app',
        'Log call outcomes to track sales and support metrics',
        'Use call scheduling for appointment confirmations',
        'Combine calls with chat for a complete communication history'
      ]
    },
    {
      id: 'booking-system',
      title: 'Appointment Booking',
      icon: '📅',
      content: 'Let customers book appointments automatically via WhatsApp. Set your availability, and ZENZAP handles scheduling, confirmations, and reminders.',
      steps: [
        'Go to Dashboard → Appointment Booking',
        'Set your available time slots and duration',
        'Customers can say "book appointment" to start the booking flow',
        'ZENZAP confirms bookings and sends automatic reminders',
        'View and manage all appointments in the booking dashboard'
      ],
      tips: [
        'Set reminders to reduce no-shows by up to 50%',
        'Block time for lunch breaks and holidays',
        'Sync with Google Calendar for unified scheduling',
        'Offer rescheduling options in reminder messages'
      ]
    },
    {
      id: 'subscription-plans',
      title: 'Subscription Plans',
      icon: '💎',
      content: 'ZENZAP offers four subscription tiers to match your business needs. From free basic features to enterprise-grade Business plan with unlimited everything.',
      steps: [
        'Go to Settings → Subscription to compare plans',
        'Review features, message limits, and agent seats per plan',
        'Free: 500 msgs/month, 1 agent, basic features',
        'Starter: R299/month, 5,000 msgs, 3 agents, advanced features',
        'Pro: R599/month, 25,000 msgs, 10 agents, AI + integrations',
        'Business: R999/month, unlimited everything, all integrations',
        'Upgrade anytime - changes take effect immediately'
      ],
      tips: [
        'All paid plans include a 14-day free trial',
        'Cancel anytime with no penalties or contracts',
        'Annual billing saves 20% on all plans',
        'Upgrade or downgrade anytime as your needs change',
        'Contact support for custom enterprise plans'
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: '🔧',
      content: 'Common issues and how to resolve them quickly.',
      steps: [
        'QR code not scanning? Refresh the page and try again. Ensure your phone has an active internet connection.',
        'Not receiving messages? Check your WhatsApp Business app is active and your phone is connected to the internet.',
        'Auto-replies not working? Verify keywords are spelled correctly and rules are toggled ON.',
        'Connection dropped? Go to Settings, disconnect WhatsApp, and reconnect using the QR code.',
        'Broadcasts failing? Check your subscription plan limits - Free plan has 10 broadcasts/month.',
        'Templates rejected? Ensure compliance with WhatsApp Commerce policies. Avoid promotional language in Utility templates.',
        'Slow performance? Enable Low Data Mode in Settings for load shedding and slow connections.',
        'Payment not processing? Contact PayFast support or try an alternative payment method.',
        'ZENZAP not loading? Clear your browser cache or try incognito mode. Ensure cookies are enabled.'
      ],
      tips: [
        'Always keep your browser and WhatsApp Business app updated',
        'Use Chrome, Firefox, or Edge for the best ZENZAP experience',
        'For urgent issues, email support@zenzap.co.za',
        'Check the ZENZAP status page for service outages',
        'Join the ZENZAP community for tips and best practices'
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
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 max-h-screen overflow-y-auto">
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