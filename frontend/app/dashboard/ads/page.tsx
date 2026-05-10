'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function AdsPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkId, setLinkId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    if (!phoneNumber) {
      alert('Please enter your WhatsApp number');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/ads/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          message,
          utmSource: utmSource || 'zenzap',
          utmCampaign: utmCampaign || 'whatsapp_ad'
        })
      });
      
      const data = await response.json();
      setGeneratedLink(data.url);
      setLinkId(data.linkId);
    } catch (error) {
      alert('Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Click-to-WhatsApp Ads</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">📢</div>
            <h1 className="text-2xl font-bold text-white mb-2">Click-to-WhatsApp Ads</h1>
            <p className="text-gray-300">
              Create links that open WhatsApp when clicked. Perfect for Facebook, Instagram ads, or your website.
            </p>
          </div>

          <div className="space-y-6">
            {/* Phone Number Input */}
            <div>
              <label className="block text-gray-300 mb-2">Your WhatsApp Number *</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 27739304732 or 0739304732"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
              <p className="text-gray-500 text-xs mt-1">Include country code (27 for South Africa)</p>
            </div>

            {/* Pre-filled Message (Optional) */}
            <div>
              <label className="block text-gray-300 mb-2">Pre-filled Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hello! I'm interested in your services..."
                rows={3}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
              <p className="text-gray-500 text-xs mt-1">This message will be pre-filled when customers click the link</p>
            </div>

            {/* UTM Tracking (Simplified) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Campaign Name (Optional)</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="e.g., black_friday_sale"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Source (Optional)</label>
                <select
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="">Select source...</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="website">Website</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateLink}
              disabled={loading || !phoneNumber}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate WhatsApp Link →'}
            </button>

            {/* Generated Link Display */}
            {generatedLink && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-green-500/30">
                <h3 className="text-green-400 font-semibold mb-2">✅ Your WhatsApp Link is Ready!</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                
                {/* QR Code */}
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm mb-2">QR Code (scan with phone)</p>
                  <div className="bg-white p-3 rounded-xl inline-block">
                    <QRCodeSVG value={generatedLink} size={150} />
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-400">
                  <p>📋 How to use:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Copy this link and paste it in your Facebook/Instagram ad</li>
                    <li>Customers who click will open WhatsApp with your pre-filled message</li>
                    <li>Use the QR code on your website or business cards</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Simple Explanation */}
          <div className="mt-8 bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
            <h3 className="text-blue-400 font-semibold mb-2">💡 Why use Click-to-WhatsApp Ads?</h3>
            <p className="text-gray-300 text-sm">
              When customers click your ad, WhatsApp opens automatically with a message ready to send.
              This makes it super easy for customers to contact you!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}