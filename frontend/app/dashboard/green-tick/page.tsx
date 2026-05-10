'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VerificationStatus {
  status: string;
  businessVerified: boolean;
  displayNameSubmitted: boolean;
  documentsUploaded: boolean;
}

export default function GreenTickPage() {
  const [status, setStatus] = useState<VerificationStatus>({
    status: 'not_started',
    businessVerified: false,
    displayNameSubmitted: false,
    documentsUploaded: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/verification/status?userId=${userId}`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStep = async (step: string, value: boolean) => {
    try {
      const userId = localStorage.getItem('userId');
      await fetch('/api/verification/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, [step]: value })
      });
      await fetchStatus();
    } catch (error) {
      console.error('Failed to update step:', error);
    }
  };

  const getProgressPercentage = () => {
    const steps = [status.businessVerified, status.displayNameSubmitted, status.documentsUploaded];
    const completed = steps.filter(s => s === true).length;
    return (completed / 3) * 100;
  };

  const getStatusBadge = () => {
    switch (status.status) {
      case 'approved': return { text: '✅ Approved', color: 'bg-green-500/20 text-green-400' };
      case 'submitted': return { text: '⏳ Under Review', color: 'bg-yellow-500/20 text-yellow-400' };
      case 'rejected': return { text: '❌ Rejected', color: 'bg-red-500/20 text-red-400' };
      default: return { text: '📝 Not Started', color: 'bg-gray-500/20 text-gray-400' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading verification guide...</div>
      </div>
    );
  }

  const statusBadge = getStatusBadge();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Green Tick Verification</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">✅🔒</div>
            <div>
              <h1 className="text-2xl font-bold text-white">WhatsApp Green Tick Verification</h1>
              <p className="text-gray-300">Get the official verified badge for your business</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`inline-block px-4 py-2 rounded-full ${statusBadge.color} mb-4`}>
            {statusBadge.text}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Verification Progress</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${getProgressPercentage()}%` }}></div>
            </div>
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">📋 Requirements Checklist</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <div className="text-white font-medium">Business Verified with Meta</div>
                <div className="text-gray-400 text-sm">Complete business verification in Meta Business Suite</div>
              </div>
              <button
                onClick={() => updateStep('businessVerified', !status.businessVerified)}
                className={`px-3 py-1 rounded text-sm transition ${
                  status.businessVerified
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {status.businessVerified ? '✅ Completed' : 'Mark Complete'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <div className="text-white font-medium">Display Name Matches Business Name</div>
                <div className="text-gray-400 text-sm">Your WhatsApp display name must match your verified business name</div>
              </div>
              <button
                onClick={() => updateStep('displayNameSubmitted', !status.displayNameSubmitted)}
                className={`px-3 py-1 rounded text-sm transition ${
                  status.displayNameSubmitted
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {status.displayNameSubmitted ? '✅ Completed' : 'Mark Complete'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <div className="text-white font-medium">Business Documents Uploaded</div>
                <div className="text-gray-400 text-sm">Registration certificate, utility bill, etc.</div>
              </div>
              <button
                onClick={() => updateStep('documentsUploaded', !status.documentsUploaded)}
                className={`px-3 py-1 rounded text-sm transition ${
                  status.documentsUploaded
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {status.documentsUploaded ? '✅ Completed' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">📖 Step-by-Step Guide</h2>
          
          <div className="space-y-4">
            <div className="p-3 border-l-4 border-blue-500 bg-white/5 rounded-r-lg">
              <h3 className="text-white font-semibold">Step 1: Verify Your Business with Meta</h3>
              <p className="text-gray-400 text-sm mt-1">Go to Meta Business Suite → Settings → Business Info → Verification</p>
              <a 
                href="https://business.facebook.com/overview" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-2 text-orange-400 text-sm hover:text-orange-300"
              >
                Go to Meta Business Suite →
              </a>
            </div>

            <div className="p-3 border-l-4 border-blue-500 bg-white/5 rounded-r-lg">
              <h3 className="text-white font-semibold">Step 2: Submit Green Tick Application</h3>
              <p className="text-gray-400 text-sm mt-1">Go to WhatsApp Manager → Phone Numbers → Request Verification</p>
              <a 
                href="https://business.facebook.com/wa/manage/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-2 text-orange-400 text-sm hover:text-orange-300"
              >
                Go to WhatsApp Manager →
              </a>
            </div>

            <div className="p-3 border-l-4 border-blue-500 bg-white/5 rounded-r-lg">
              <h3 className="text-white font-semibold">Step 3: Upload Required Documents</h3>
              <p className="text-gray-400 text-sm mt-1">Prepare your business registration certificate, tax clearance, and utility bill</p>
              <details className="mt-2">
                <summary className="text-blue-400 text-sm cursor-pointer">View document requirements</summary>
                <ul className="mt-2 text-gray-400 text-sm list-disc list-inside space-y-1">
                  <li>Official business registration certificate</li>
                  <li>Tax clearance certificate (for South Africa)</li>
                  <li>Utility bill with business address</li>
                  <li>Director's ID document</li>
                </ul>
              </details>
            </div>

            <div className="p-3 border-l-4 border-blue-500 bg-white/5 rounded-r-lg">
              <h3 className="text-white font-semibold">Step 4: Wait for Review</h3>
              <p className="text-gray-400 text-sm mt-1">Meta typically reviews applications within 5-7 business days</p>
            </div>

            <div className="p-3 border-l-4 border-green-500 bg-white/5 rounded-r-lg">
              <h3 className="text-white font-semibold">Step 5: Verification Complete</h3>
              <p className="text-gray-400 text-sm mt-1">Once approved, your business will display a Green Tick badge on WhatsApp</p>
            </div>
          </div>
        </div>

        {/* Document Templates */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">📄 Document Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <div className="text-3xl mb-2">📝</div>
              <div className="text-white font-medium">Letter of Authorization</div>
              <p className="text-gray-400 text-sm">Template for authorized representative</p>
              <button className="mt-2 text-orange-400 text-sm">Download Template →</button>
            </div>
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <div className="text-3xl mb-2">🏢</div>
              <div className="text-white font-medium">Business Registration Affidavit</div>
              <p className="text-gray-400 text-sm">For businesses without formal registration</p>
              <button className="mt-2 text-orange-400 text-sm">Download Template →</button>
            </div>
          </div>
        </div>

        {/* Need Help */}
        <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30 text-center">
          <h3 className="text-orange-400 font-semibold mb-2">Need Help with Verification?</h3>
          <p className="text-gray-300 text-sm">Contact our support team for assistance with your green tick application.</p>
          <Link href="/dashboard/chat" className="inline-block mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}