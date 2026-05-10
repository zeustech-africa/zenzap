'use client';

import { useState } from 'react';
import Link from 'next/link';

interface IntentRule {
  id: string;
  intent: string;
  keywords: string[];
  action: string;
  autoRespond: boolean;
  responseTemplate?: string;
}

export default function NLUPage() {
  const [testMessage, setTestMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [rules, setRules] = useState<IntentRule[]>([
    { id: '1', intent: 'booking', keywords: ['book', 'appointment', 'schedule'], action: 'Show booking link', autoRespond: true, responseTemplate: 'I can help you book an appointment. What date works for you?' },
    { id: '2', intent: 'pricing', keywords: ['price', 'cost', 'how much'], action: 'Send price list', autoRespond: true, responseTemplate: 'Our prices start from R150. Would you like to see our full price list?' },
    { id: '3', intent: 'support', keywords: ['help', 'support', 'issue'], action: 'Connect to agent', autoRespond: false },
    { id: '4', intent: 'complaint', keywords: ['complaint', 'bad', 'problem'], action: 'Escalate to manager', autoRespond: false },
    { id: '5', intent: 'greeting', keywords: ['hello', 'hi', 'hey'], action: 'Send welcome message', autoRespond: true, responseTemplate: 'Hello! Welcome to our business. How can I help you today?' }
  ]);

  const testAnalysis = async () => {
    if (!testMessage) return;
    
    setAnalyzing(true);
    try {
      const response = await fetch('/api/nlu/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testMessage })
      });
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      alert('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const updateRule = (id: string, updates: Partial<IntentRule>) => {
    setRules(rules.map(rule => rule.id === id ? { ...rule, ...updates } : rule));
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'booking': return 'bg-blue-500/20 text-blue-400';
      case 'pricing': return 'bg-green-500/20 text-green-400';
      case 'support': return 'bg-purple-500/20 text-purple-400';
      case 'complaint': return 'bg-red-500/20 text-red-400';
      case 'greeting': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">AI Understanding</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Test Message Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-bold mb-4">🧪 Test AI Understanding</h2>
          <p className="text-gray-400 text-sm mb-4">Type a message to see how the AI will understand your customers</p>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="e.g., I want to book an appointment for Friday"
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
            />
            <button
              onClick={testAnalysis}
              disabled={analyzing || !testMessage}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Test'}
            </button>
          </div>
          
          {analysisResult && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-400 text-sm">Detected Intent:</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getIntentColor(analysisResult.intent)}`}>
                    {analysisResult.intent}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Confidence:</span>
                  <span className="ml-2 text-white">{(analysisResult.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              {analysisResult.entities && (
                <div className="mt-2 text-gray-400 text-sm">
                  Detected: {Object.entries(analysisResult.entities).map(([key, val]) => `${key}: ${val}`).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Intent Rules */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h2 className="text-white font-bold mb-4">🤖 Intent Rules</h2>
          <p className="text-gray-400 text-sm mb-4">When ZENZAP detects a customer intent, it will take action</p>
          
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getIntentColor(rule.intent)}`}>
                        {rule.intent}
                      </span>
                      <span className="text-gray-400 text-sm">Keywords: {rule.keywords.join(', ')}</span>
                    </div>
                    <div className="mt-2 text-gray-300 text-sm">Action: {rule.action}</div>
                    {rule.autoRespond && rule.responseTemplate && (
                      <div className="mt-2 text-gray-400 text-sm bg-white/5 p-2 rounded">
                        💬 Response: "{rule.responseTemplate}"
                      </div>
                    )}
                  </div>
                  <button className="text-gray-400 hover:text-orange-400 text-sm">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simple Explanation */}
        <div className="mt-6 bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-blue-400 font-semibold mb-2">💡 How AI Understanding Works</h3>
          <p className="text-gray-300 text-sm">
            ZENZAP reads your customer's message and figures out what they want:
            • Booking → Helps them schedule an appointment
            • Pricing → Shares your price information
            • Support → Connects them to a human agent
            • Complaint → Escalates to manager
          </p>
        </div>
      </div>
    </div>
  );
}