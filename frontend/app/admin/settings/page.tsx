'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    systemName: 'ZENZAP',
    adminEmail: 'admin@zenzap.com',
    maintenanceMode: false,
    emailNotifications: true
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
  }, []);

  const saveSettings = async () => {
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('Settings saved!');
    } catch (error) {
      alert('Failed to save settings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-white transition">← Dashboard</Link>
          <span className="text-white font-bold ml-4">System Settings</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <h2 className="text-white font-bold mb-6">Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">System Name</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Admin Email</label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white">Maintenance Mode</div>
                <div className="text-gray-400 text-sm">Block user access during updates</div>
              </div>
              <button
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`w-12 h-6 rounded-full transition ${settings.maintenanceMode ? 'bg-orange-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white">Email Notifications</div>
                <div className="text-gray-400 text-sm">Receive alerts for new registrations</div>
              </div>
              <button
                onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                className={`w-12 h-6 rounded-full transition ${settings.emailNotifications ? 'bg-orange-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>

          <button
            onClick={saveSettings}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}