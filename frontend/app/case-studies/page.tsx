'use client';

import Link from 'next/link';

const caseStudies = [
  {
    title: "How Mama Ntuli's Kitchen Grew 300% with ZENZAP",
    industry: "Food & Catering",
    summary: "A small catering business in Soweto used ZENZAP to automate order taking and saw 300% growth in 6 months.",
    results: ["300% revenue growth", "80% less admin time", "Zero missed orders"],
  },
  {
    title: "Cape Town Dental Practice Saves 20 Hours/Week",
    industry: "Healthcare",
    summary: "Dr. Van der Merwe's dental practice automated appointment reminders and reduced no-shows by 75%.",
    results: ["75% fewer no-shows", "20 hours saved weekly", "98% patient satisfaction"],
  },
  {
    title: "Jo'burg Real Estate Agency Closes 40% More Deals",
    industry: "Real Estate",
    summary: "A Johannesburg property agency uses ZENZAP to capture and nurture leads automatically.",
    results: ["40% more closed deals", "500+ leads captured/month", "2x faster response time"],
  },
];

export default function CaseStudiesPage() {
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
        <h1 className="text-4xl font-bold text-white mb-4">Case Studies</h1>
        <p className="text-gray-300 mb-8">Real stories from African businesses using ZENZAP to grow.</p>
        
        <div className="space-y-6">
          {caseStudies.map((study, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="text-orange-400 text-sm mb-2">{study.industry}</div>
              <h2 className="text-xl font-bold text-white mb-3">{study.title}</h2>
              <p className="text-gray-300 mb-4">{study.summary}</p>
              <div className="flex flex-wrap gap-3">
                {study.results.map((result, i) => (
                  <span key={i} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm border border-green-500/30">
                    📈 {result}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}