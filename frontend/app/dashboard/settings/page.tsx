'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('My Business');
  const [email, setEmail] = useState('owner@business.com');
  const [phone, setPhone] = useState('+27 82 123 4567');
  const [notifications, setNotifications] = useState(true);
  const [lowDataMode, setLowDataMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lowDataMode') === 'true';
    setLowDataMode(saved);
    if (saved) {
      document.body.classList.add('low-data-mode');
    }

    // Load user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setBusinessName(user.businessName || 'My Business');
      setEmail(user.email || 'owner@business.com');
    }
  }, []);

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
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-white font-bold mb-6">Business Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">WhatsApp Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-white font-medium">Push Notifications</div>
                <div className="text-gray-400 text-sm">Receive alerts for new messages</div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition ${notifications ? 'bg-orange-500' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`}></div>
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

          <button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition">
            Save Changes
          </button>

          <div className="mt-6 pt-4 border-t border-white/20">
            <h3 className="text-white font-medium mb-3">Subscription</h3>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white">Free Plan</div>
                <div className="text-gray-400 text-sm">500 messages/month, 1 agent</div>
              </div>
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-1 rounded-lg transition">
                Upgrade
              </button>
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