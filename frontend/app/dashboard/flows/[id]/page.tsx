'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function generateId(): string {
  return crypto.randomUUID();
}

interface Step {
  id: string;
  order: number;
  condition?: { type: 'if' | 'else' | 'if_not'; matches?: string[]; intent?: string };
  action: { type: string; message?: string; messageVariables?: string[]; tag?: string; agentId?: string; url?: string; method?: 'GET' | 'POST' };
}

interface Trigger {
  type: 'keyword' | 'welcome' | 'time' | 'broadcast';
  keyword?: string;
  keywords?: string[];
  delay?: number;
}

interface Flow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  trigger: Trigger;
  steps: Step[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function FlowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const flowId = params.id as string;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<Trigger>({ type: 'welcome' });
  const [keywordInput, setKeywordInput] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchFlow();
  }, [flowId]);

  const fetchFlow = async () => {
    try {
      const response = await fetch(`/api/flows/${flowId}`);
      if (!response.ok) {
        setError('Flow not found');
        setLoading(false);
        return;
      }
      const flow: Flow = await response.json();
      setName(flow.name);
      setDescription(flow.description || '');
      setTrigger(flow.trigger);
      if (flow.trigger.keyword) {
        setKeywordInput(flow.trigger.keyword);
      }
      setSteps(flow.steps);
    } catch (err) {
      setError('Failed to load flow');
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    const newStep: Step = {
      id: generateId(),
      order: steps.length + 1,
      action: { type: 'send_message', message: '' }
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    const updated = steps.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }));
    setSteps(updated);
  };

  const updateStepMessage = (id: string, message: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, action: { ...s.action, message } } : s));
  };

  const updateStepActionType = (id: string, type: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, action: { ...s.action, type, message: type === 'send_message' ? s.action.message || '' : undefined, tag: type === 'add_tag' || type === 'remove_tag' ? s.action.tag || '' : undefined } } : s));
  };

  const updateStepTag = (id: string, tag: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, action: { ...s.action, tag } } : s));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a flow name');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    const flowTrigger = { ...trigger };
    if (flowTrigger.type === 'keyword' && keywordInput.trim()) {
      flowTrigger.keyword = keywordInput.trim();
    }

    try {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          trigger: flowTrigger,
          steps: steps.filter(s => s.action.message || s.action.tag || s.action.url)
        })
      });

      if (response.ok) {
        setSuccessMsg('Flow updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update flow');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading flow editor...</div>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/dashboard/flows" className="text-orange-400 hover:text-orange-300">
            ← Back to Flows
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard/flows" className="text-gray-400 hover:text-white transition">
            ← Back to Flows
          </Link>
          <span className="text-white font-bold ml-4">Edit Flow</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-4">
            {successMsg}
          </div>
        )}

        {/* Flow Info */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Flow Details</h2>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1">Flow Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Welcome Message"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this flow do?"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Trigger */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Trigger</h2>
          <p className="text-gray-400 text-sm mb-3">When should this flow start?</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {(['welcome', 'keyword', 'time', 'broadcast'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTrigger({ type: t })}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  trigger.type === t
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {t === 'welcome' && 'Welcome Message'}
                {t === 'keyword' && 'Keyword'}
                {t === 'time' && 'Time Delay'}
                {t === 'broadcast' && 'Broadcast'}
              </button>
            ))}
          </div>

          {trigger.type === 'keyword' && (
            <div>
              <label className="block text-gray-300 text-sm mb-1">Keyword *</label>
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="e.g., book, price, help"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}

          {trigger.type === 'time' && (
            <div>
              <label className="block text-gray-300 text-sm mb-1">Delay (minutes)</label>
              <input
                type="number"
                value={trigger.delay || ''}
                onChange={(e) => setTrigger({ ...trigger, delay: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 60"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold">Steps</h2>
            <button
              onClick={addStep}
              className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 px-3 py-1 rounded-lg text-sm transition"
            >
              + Add Step
            </button>
          </div>

          {steps.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No steps yet. Add a step to define what happens when this flow triggers.
            </p>
          )}

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={step.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white text-sm font-medium">Step {idx + 1}</span>
                  <button
                    onClick={() => removeStep(step.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="mb-3">
                  <label className="block text-gray-400 text-xs mb-1">Action Type</label>
                  <select
                    value={step.action.type}
                    onChange={(e) => updateStepActionType(step.id, e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="send_message">Send Message</option>
                    <option value="add_tag">Add Tag</option>
                    <option value="remove_tag">Remove Tag</option>
                    <option value="assign_agent">Assign Agent</option>
                    <option value="http_request">HTTP Request</option>
                    <option value="end">End Flow</option>
                  </select>
                </div>

                {(step.action.type === 'send_message') && (
                  <div className="mb-3">
                    <label className="block text-gray-400 text-xs mb-1">Message</label>
                    <textarea
                      value={step.action.message || ''}
                      onChange={(e) => updateStepMessage(step.id, e.target.value)}
                      placeholder="Type your message here..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                    />
                  </div>
                )}

                {(step.action.type === 'add_tag' || step.action.type === 'remove_tag') && (
                  <div className="mb-3">
                    <label className="block text-gray-400 text-xs mb-1">Tag</label>
                    <input
                      type="text"
                      value={step.action.tag || ''}
                      onChange={(e) => updateStepTag(step.id, e.target.value)}
                      placeholder="e.g., vip, lead, booking"
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}

                {step.action.type === 'http_request' && (
                  <div className="mb-3 space-y-2">
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">URL</label>
                      <input
                        type="text"
                        value={step.action.url || ''}
                        onChange={(e) => setSteps(steps.map(s => s.id === step.id ? { ...s, action: { ...s.action, url: e.target.value } } : s))}
                        placeholder="https://example.com/webhook"
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Method</label>
                      <select
                        value={step.action.method || 'GET'}
                        onChange={(e) => setSteps(steps.map(s => s.id === step.id ? { ...s, action: { ...s.action, method: e.target.value as 'GET' | 'POST' } } : s))}
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/flows"
            className="bg-white/10 text-gray-300 hover:bg-white/20 px-6 py-2 rounded-lg transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Flow'}
          </button>
        </div>
      </div>
    </div>
  );
}