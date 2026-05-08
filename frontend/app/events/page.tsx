'use client';

import Link from 'next/link';

const events = [
  { date: "May 15, 2026", title: "WhatsApp Automation Webinar", time: "11:00 AM SAST", type: "Free", registerLink: "/register" },
  { date: "May 22, 2026", title: "Cape Town Business Meetup", time: "2:00 PM SAST", type: "Free", registerLink: "/register" },
  { date: "June 5, 2026", title: "Advanced Auto-Replies Workshop", time: "10:00 AM SAST", type: "Paid", registerLink: "/register" },
];

export default function EventsPage() {
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
        <h1 className="text-4xl font-bold text-white mb-6">Upcoming Events</h1>
        <div className="space-y-4">
          {events.map((event, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <div className="text-orange-400 text-sm">{event.date}</div>
                  <h2 className="text-xl font-bold text-white">{event.title}</h2>
                  <p className="text-gray-400 mt-1">{event.time}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-gray-300 text-sm">{event.type}</span>
                  <Link href={event.registerLink} className="block mt-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition">Register →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}