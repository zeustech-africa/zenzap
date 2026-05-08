'use client';

import Link from 'next/link';

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-white mb-6">Terms of Service</h1>
        <p className="text-gray-400 mb-6">Last updated: April 1, 2026</p>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using ZENZAP ("the Service"), operated by ZEUSTECH (PTY) LTD ("we," "us," "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Service Description</h2>
            <p>ZENZAP provides a WhatsApp Business automation platform that enables businesses to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Send and receive automated WhatsApp messages</li>
              <li>Manage customer communications and contacts</li>
              <li>Set up booking systems and appointment reminders</li>
              <li>Access analytics and reporting tools</li>
              <li>Integrate with the WhatsApp Business API</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Account Registration</h2>
            <p>To use ZENZAP, you must:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Provide valid identity documentation for verification (required for WhatsApp Business API access)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Acceptable Use Policy</h2>
            <p>You agree not to use ZENZAP to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Send spam, unsolicited messages, or violate anti-spam laws</li>
              <li>Impersonate others or engage in fraudulent activity</li>
              <li>Violate WhatsApp's Business Messaging Policy</li>
              <li>Transmit malware, viruses, or harmful code</li>
              <li>Engage in any illegal activities under South African law</li>
              <li>Harass, threaten, or abuse other users or customers</li>
            </ul>
            <p className="mt-2 text-orange-400 font-semibold">Violation of these terms may result in immediate account suspension.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Subscription & Payments</h2>
            <p>ZENZAP offers free and paid subscription tiers. By subscribing to a paid plan:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>You agree to pay all fees in South African Rand (ZAR)</li>
              <li>Payments are processed securely via PayFast</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>Refunds are handled on a case-by-case basis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. WhatsApp Compliance</h2>
            <p>ZENZAP operates as a WhatsApp Business Solution Provider (BSP). You must comply with:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>WhatsApp Business Messaging Policy</li>
              <li>WhatsApp Commerce Policy</li>
              <li>Meta Platform Terms</li>
              <li>All applicable opt-in requirements</li>
            </ul>
            <p className="mt-2">We reserve the right to suspend accounts that violate WhatsApp's policies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by South African law, ZEUSTECH (PTY) LTD shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Intellectual Property</h2>
            <p>ZENZAP, its logo, and all related content are the intellectual property of ZEUSTECH (PTY) LTD. You may not copy, modify, or distribute any part of the Service without our prior written consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Termination</h2>
            <p>We reserve the right to terminate or suspend your account at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the Service will immediately cease.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the Republic of South Africa. Any disputes shall be subject to the exclusive jurisdiction of the courts of South Africa.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Contact Information</h2>
            <p>For questions about these Terms, contact us:</p>
            <p className="mt-2">
              Email: legal@zenzap.co.za<br />
              Phone: +27 21 555 0123<br />
              Address: ZEUSTECH (PTY) LTD<br />
              Registration: 2024/123456/07<br />
              Cape Town, South Africa
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}