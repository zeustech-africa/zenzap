'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserSettings {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  timezone: string;
  notifications: {
    email: boolean;
    whatsapp: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    timezone: 'Africa/Johannesburg',
    notifications: { email: true, whatsapp: true },
  });
  const [lowDataMode, setLowDataMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zenzap-backend.onrender.com';
  
  // Fetch settings on load
  useEffect(() => {
    fetchSettings();
    
    // Load low data mode preference from localStorage (UI only)
    const saved = localStorage.getItem('lowDataMode') === 'true';
    setLowDataMode(saved);
    if (saved) {
      document.body.classList.add('low-data-mode');
    }
  }, []);
  
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setSettings({
          businessName: data.businessName || '',
          businessEmail: data.businessEmail || '',
          businessPhone: data.businessPhone || '',
          timezone: data.timezone || 'Africa/Johannesburg',
          notifications: data.notifications || { email: true, whatsapp: true },
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    setSaving(true);
    
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          businessName: settings.businessName,
          businessEmail: settings.businessEmail,
          businessPhone: settings.businessPhone,
          timezone: settings.timezone,
          notifications: settings.notifications,
        }),
      });
      
      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save settings');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const toggleLowDataMode = () => {
    const newValue = !lowDataMode;
    setLowDataMode(newValue);
    localStorage.setItem('lowDataMode', String(newValue));
    if (newValue) {
      document.body.classList.add('low-data-mode');
    } else {
      document.body.classList.remove('low-data-mode');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-gray-400">Loading settings...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Settings</span>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {/* WhatsApp Connection Link */}
        <Link
          href="/dashboard/whatsapp-connection"
          className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition mb-6 border border-white/10"
        >
          <div>
            <div className="text-white font-medium">📱 Connect WhatsApp Business</div>
            <div className="text-gray-400 text-sm">Click to connect your WhatsApp Business account</div>
          </div>
          <span className="text-orange-400">→</span>
        </Link>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-white font-bold mb-6">Business Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                placeholder="Your business name"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email Address</label>
              <input
                type="email"
                value={settings.businessEmail}
                onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                placeholder="contact@yourbusiness.com"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2">WhatsApp Number</label>
              <input
                type="tel"
                value={settings.businessPhone}
                onChange={(e) => setSettings({ ...settings, businessPhone: e.target.value })}
                placeholder="+27 82 123 4567"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="Africa/Johannesburg">South Africa (GMT+2)</option>
                <option value="Africa/Lagos">Nigeria (GMT+1)</option>
                <option value="Africa/Nairobi">Kenya (GMT+3)</option>
                <option value="Africa/Cairo">Egypt (GMT+2)</option>
                <option value="Africa/Casablanca">Morocco (GMT+1)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-white font-medium">Email Notifications</div>
                <div className="text-gray-400 text-sm">Receive alerts for new messages via email</div>
              </div>
              <button
                onClick={() => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: !settings.notifications.email }
                })}
                className={`w-12 h-6 rounded-full transition ${settings.notifications.email ? 'bg-orange-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${settings.notifications.email ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-white font-medium">WhatsApp Notifications</div>
                <div className="text-gray-400 text-sm">Receive alerts for new messages via WhatsApp</div>
              </div>
              <button
                onClick={() => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, whatsapp: !settings.notifications.whatsapp }
                })}
                className={`w-12 h-6 rounded-full transition ${settings.notifications.whatsapp ? 'bg-orange-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${settings.notifications.whatsapp ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-white/20">
              <div>
                <div className="text-white font-medium">📶 Low Data Mode</div>
                <div className="text-gray-400 text-sm">Optimize for slow internet connections (load shedding friendly)</div>
              </div>
              <button
                onClick={toggleLowDataMode}
                className={`w-12 h-6 rounded-full transition ${lowDataMode ? 'bg-orange-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${lowDataMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>
            
            {/* Logout Section */}
            <div className="pt-6 border-t border-white/20">
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <div className="mt-6 pt-4 border-t border-white/20">
            <h3 className="text-white font-medium mb-3">Subscription</h3>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white">Free Plan</div>
                <div className="text-gray-400 text-sm">500 messages/month, 1 agent</div>
              </div>
              <Link
                href="/dashboard/subscription"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-white font-bold text-lg mb-4">Confirm Logout</h2>
            <p className="text-gray-300 mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
              >
                Logout
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}