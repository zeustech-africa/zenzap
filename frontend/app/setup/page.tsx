'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    whatsappNumber: '',
    industry: '',
    businessHours: '09:00-17:00',
    autoReply: true
  });

  const industries = [
    { id: 'salon', name: 'Salon & Spa', icon: '💇' },
    { id: 'restaurant', name: 'Restaurant & Cafe', icon: '🍽️' },
    { id: 'realestate', name: 'Real Estate', icon: '🏠' },
    { id: 'retail', name: 'Retail & E-commerce', icon: '🛍️' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'other', name: 'Other Business', icon: '📈' }
  ];

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    // Save setup data and redirect to dashboard
    localStorage.setItem('setupComplete', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`text-center ${step >= i ? 'text-orange-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
                  step >= i ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-400'
                }`}>
                  {i}
                </div>
                <div className="text-xs">
                  {i === 1 && 'Connect'}
                  {i === 2 && 'Configure'}
                  {i === 3 && 'Ready'}
                </div>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        {/* Step 1: Connect WhatsApp */}
        {step === 1 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => document.getElementById('support-widget-trigger')?.click()}
                className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1"
              >
                ❓ Need help?
              </button>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Connect your WhatsApp</h1>
            <p className="text-gray-300 mb-6">Enter your WhatsApp Business number to get started.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">WhatsApp Business Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="+27 XX XXX XXXX"
                />
                <p className="text-gray-400 text-xs mt-1">Must be a registered WhatsApp Business account</p>
              </div>
            </div>

            <button
              onClick={nextStep}
              disabled={!formData.whatsappNumber}
              className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Choose Industry */}
        {step === 2 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => document.getElementById('support-widget-trigger')?.click()}
                className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1"
              >
                ❓ Need help?
              </button>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Choose your industry</h1>
            <p className="text-gray-300 mb-6">Select your business type to get a pre-configured setup.</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {industries.map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => setFormData({...formData, industry: industry.id})}
                  className={`p-4 rounded-xl text-center transition ${
                    formData.industry === industry.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{industry.icon}</div>
                  <div className="text-sm">{industry.name}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Business Hours</label>
              <input
                type="text"
                value={formData.businessHours}
                onChange={(e) => setFormData({...formData, businessHours: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                placeholder="09:00-17:00"
              />
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={prevStep}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={!formData.industry}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ready to Go */}
        {step === 3 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => document.getElementById('support-widget-trigger')?.click()}
                className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1"
              >
                ❓ Need help?
              </button>
            </div>
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">You're all set!</h1>
            <p className="text-gray-300 mb-6">
              Your ZENZAP automation is ready. We've pre-configured your chatbot for {industries.find(i => i.id === formData.industry)?.name}.
            </p>
            
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-sm">Your WhatsApp number:</p>
              <p className="text-white font-medium">{formData.whatsappNumber || 'Not provided'}</p>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}