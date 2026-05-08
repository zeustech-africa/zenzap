'use client';

import Link from 'next/link';

const blogs = [
  {
    title: "10 WhatsApp Automation Tips for Small Businesses",
    date: "April 2, 2026",
    category: "Tips & Tricks",
    excerpt: "Learn how to save 10+ hours per week by automating your WhatsApp customer communication.",
    readTime: "5 min read",
  },
  {
    title: "Why African Businesses Need WhatsApp Automation in 2026",
    date: "March 28, 2026",
    category: "Industry Insights",
    excerpt: "WhatsApp is the #1 messaging app in Africa. Here's why your business should be using it for more than just chat.",
    readTime: "7 min read",
  },
  {
    title: "How to Reduce Customer Response Time by 90%",
    date: "March 20, 2026",
    category: "Guides",
    excerpt: "Speed matters. Discover how automated replies and smart routing can transform your customer experience.",
    readTime: "6 min read",
  },
  {
    title: "The Complete Guide to WhatsApp Business API",
    date: "March 15, 2026",
    category: "Guides",
    excerpt: "Everything you need to know about the WhatsApp Business API and how to get started.",
    readTime: "10 min read",
  },
  {
    title: "Load Shedding? 5 Ways Automation Keeps Your Business Running",
    date: "March 10, 2026",
    category: "Tips & Tricks",
    excerpt: "When the power goes out, your automated replies keep working. Here's how to prepare.",
    readTime: "4 min read",
  },
  {
    title: "Customer Success Story: From Paper to Digital in 2 Weeks",
    date: "March 5, 2026",
    category: "Case Studies",
    excerpt: "See how a Durban-based retailer digitized their entire order process with ZENZAP.",
    readTime: "8 min read",
  },
];

export default function BlogsPage() {
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
        <h1 className="text-4xl font-bold text-white mb-4">ZENZAP Blog</h1>
        <p className="text-gray-300 mb-8">Tips, guides, and insights on WhatsApp automation for African businesses.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((post, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-orange-400 text-xs font-semibold">{post.category}</span>
                <span className="text-gray-500 text-xs">{post.readTime}</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{post.title}</h2>
              <p className="text-gray-400 text-sm mb-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">{post.date}</span>
                <span className="text-orange-400 text-sm hover:underline cursor-pointer">Read more →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}