'use client';

import Link from 'next/link';

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-gray-400 mb-6">Last updated: April 1, 2026</p>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>When you use ZENZAP, we collect information necessary to provide our services:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Account information (name, email, phone number)</li>
              <li>Business details (company name, industry)</li>
              <li>WhatsApp Business API credentials</li>
              <li>Customer message data (as processed through our platform)</li>
              <li>Usage analytics and log data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Data</h2>
            <p>Your data is used exclusively to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Provide and maintain our WhatsApp automation services</li>
              <li>Process and route your customer messages</li>
              <li>Improve our platform performance and features</li>
              <li>Send important service updates and notifications</li>
              <li>Comply with legal obligations under South African law (POPIA)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Protection & POPIA Compliance</h2>
            <p>ZENZAP is fully compliant with the Protection of Personal Information Act (POPIA) of South Africa. We implement:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>End-to-end encryption for all message data</li>
              <li>Secure data storage on South African servers</li>
              <li>Regular security audits and penetration testing</li>
              <li>Strict access controls and authentication</li>
              <li>Data processing agreements available on request</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Data Retention</h2>
            <p>We retain your data only as long as your account is active or as needed to provide services. You may request deletion of your data at any time by contacting us. Customer message logs are retained for up to 90 days unless otherwise required for legal purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Your Rights</h2>
            <p>Under POPIA and applicable laws, you have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Lodge a complaint with the Information Regulator</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Third-Party Services</h2>
            <p>ZENZAP integrates with WhatsApp (Meta Platforms, Inc.) for message delivery. By using ZENZAP, you also agree to WhatsApp's Business Terms of Service. We do not sell or share your data with any other third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact Us</h2>
            <p>For privacy-related inquiries, contact our Data Protection Officer:</p>
            <p className="mt-2">
              Email: privacy@zenzap.co.za<br />
              Phone: +27 21 555 0123<br />
              Address: ZEUSTECH (PTY) LTD, Cape Town, South Africa
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}