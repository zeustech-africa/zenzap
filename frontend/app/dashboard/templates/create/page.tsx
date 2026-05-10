'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateTemplatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    category: 'marketing',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<string[]>([]);

  const extractVariables = (text: string) => {
    const regex = /{{(.*?)}}/g;
    const matches = [...text.matchAll(regex)];
    const vars = matches.map(m => m[1]);
    setVariables([...new Set(vars)]);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setFormData({ ...formData, content: newContent });
    extractVariables(newContent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: formData.name,
          category: formData.category,
          content: formData.content
        })
      });
      
      if (response.ok) {
        router.push('/dashboard/templates');
      } else {
        alert('Failed to create template');
      }
    } catch (error) {
      alert('Error creating template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard/templates" className="text-gray-400 hover:text-white transition">
            ← Templates
          </Link>
          <span className="text-white font-bold ml-4">Create Template</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h1 className="text-2xl font-bold text-white mb-6">Create Message Template</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Template Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Welcome Message"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="marketing">Marketing</option>
                <option value="utility">Utility</option>
                <option value="authentication">Authentication</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Message Content</label>
              <textarea
                required
                rows={6}
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Hello {{customer_name}}, welcome to {{business_name}}!"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 font-mono text-sm"
              />
              <p className="text-gray-400 text-xs mt-2">
                Use {'{{variable_name}}'} for dynamic content. Example: {'{{customer_name}}'}, {'{{order_number}}'}
              </p>
            </div>
            
            {variables.length > 0 && (
              <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
                <h3 className="text-orange-400 font-semibold mb-2">📋 Detected Variables</h3>
                <div className="flex flex-wrap gap-2">
                  {variables.map((v, i) => (
                    <span key={i} className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
              <h3 className="text-blue-400 font-semibold mb-2">💡 Preview</h3>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-300 text-sm">
                  {formData.content || 'Your message will appear here...'}
                </p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Template'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}