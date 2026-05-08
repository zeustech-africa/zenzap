'use client';

import Link from 'next/link';

const resources = [
  {
    title: "Getting Started Guide",
    type: "PDF Guide",
    description: "Step-by-step guide to setting up your ZENZAP account and connecting WhatsApp.",
    downloadLabel: "Download PDF",
  },
  {
    title: "Auto-Reply Templates Pack",
    type: "Templates",
    description: "10 ready-to-use message templates for common business scenarios.",
    downloadLabel: "Download Templates",
  },
  {
    title: "WhatsApp Business API Documentation",
    type: "Documentation",
    description: "Technical documentation for developers integrating with the ZENZAP API.",
    downloadLabel: "View Docs",
  },
  {
    title: "Best Practices for Customer Communication",
    type: "eBook",
    description: "Learn how to write effective automated messages that sound human.",
    downloadLabel: "Download eBook",
  },
  {
    title: "Video Tutorial: Setting Up Auto-Replies",
    type: "Video",
    description: "Watch how to configure intelligent auto-replies for your business in under 10 minutes.",
    downloadLabel: "Watch Video",
  },
  {
    title: "ROI Calculator",
    type: "Tool",
    description: "Calculate how much time and money you can save with WhatsApp automation.",
    downloadLabel: "Try Calculator",
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/zenzap-logo-icon.png" alt="ZENZAP" className="h-8 w-8" />
            <span className="text-white font-bold">ZENZAP</span>
            <span className="text-orange-400 text-xs">by ZEUSTECH</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white transition">Login</Link>
            <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition">Get Started</Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-4">Resources</h1>
        <p className="text-gray-300 mb-8">Guides, templates, and tools to help you get the most out of ZENZAP.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition">
              <span className="text-orange-400 text-xs font-semibold">{resource.type}</span>
              <h2 className="text-lg font-bold text-white mt-2 mb-2">{resource.title}</h2>
              <p className="text-gray-400 text-sm mb-4">{resource.description}</p>
              <span className="text-orange-400 text-sm hover:underline cursor-pointer">{resource.downloadLabel} →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}