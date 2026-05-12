'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
}

interface Broadcast {
  id: string;
  name: string;
  message: string;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  status: string;
  createdAt: string;
}

export default function BroadcastPage() {
  const [message, setMessage] = useState('');
  const [broadcastName, setBroadcastName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zenzap-backend.onrender.com';
  
  // Fetch contacts on load
  useEffect(() => {
    fetchContacts();
    fetchBroadcasts();
  }, []);
  
  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/contacts`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };
  
  const fetchBroadcasts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/broadcasts`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
    }
  };
  
  const handleSendBroadcast = async () => {
    if (!broadcastName.trim()) {
      alert('Please enter a broadcast name');
      return;
    }
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }
    if (selectedContacts.length === 0) {
      alert('Please select at least one recipient');
      return;
    }
    
    setSending(true);
    
    try {
      const res = await fetch(`${API_URL}/api/broadcasts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: broadcastName,
          message: message,
          recipients: selectedContacts,
        }),
      });
      
      if (res.ok) {
        alert('Broadcast sent successfully!');
        setBroadcastName('');
        setMessage('');
        setSelectedContacts([]);
        fetchBroadcasts();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to send broadcast');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  const toggleContact = (phone: string) => {
    setSelectedContacts(prev =>
      prev.includes(phone)
        ? prev.filter(p => p !== phone)
        : [...prev, phone]
    );
  };
  
  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.phone));
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sending': return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">Sending</span>;
      case 'completed': return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Completed</span>;
      case 'failed': return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">Failed</span>;
      default: return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs">Draft</span>;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Broadcast Messages</span>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="float-right text-orange-400 hover:text-orange-300"
          >
            {showHistory ? 'New Broadcast' : 'History'}
          </button>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8 max-w-3xl">
        {!showHistory ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h1 className="text-2xl font-bold text-white mb-2">Send Broadcast</h1>
            <p className="text-gray-300 mb-6">Send messages to your customers in bulk.</p>
            
            {/* Broadcast Name */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">Broadcast Name</label>
              <input
                type="text"
                value={broadcastName}
                onChange={(e) => setBroadcastName(e.target.value)}
                placeholder="e.g., Black Friday Sale, Weekly Newsletter"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
            
            {/* Contact Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-white text-sm font-medium">Recipients</label>
                <button
                  onClick={selectAllContacts}
                  className="text-xs text-orange-400 hover:text-orange-300"
                >
                  {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="bg-white/5 rounded-lg max-h-60 overflow-y-auto">
                {contacts.length === 0 ? (
                  <p className="text-gray-400 text-sm p-4">No contacts yet. Add contacts from the Contacts page.</p>
                ) : (
                  contacts.map((contact) => (
                    <label key={contact.id} className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.phone)}
                        onChange={() => toggleContact(contact.phone)}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="text-white">{contact.name || contact.phone}</div>
                        <div className="text-gray-400 text-xs">{contact.phone}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <div className="text-right text-gray-400 text-xs mt-1">
                {selectedContacts.length} contacts selected
              </div>
            </div>
            
            {/* Message Input */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                placeholder="Type your broadcast message here..."
              />
              <div className="text-right text-gray-400 text-xs mt-1">
                {message.length} characters
              </div>
            </div>
            
            {/* Send Button */}
            <button
              onClick={handleSendBroadcast}
              disabled={!broadcastName.trim() || !message.trim() || selectedContacts.length === 0 || sending}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {sending ? 'Sending...' : `Send to ${selectedContacts.length} contact(s)`}
            </button>
            
            <p className="text-gray-400 text-center text-sm mt-4">
              Messages will be sent via WhatsApp. Standard message rates apply.
            </p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h1 className="text-2xl font-bold text-white mb-4">Broadcast History</h1>
            {broadcasts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No broadcasts sent yet.</p>
            ) : (
              <div className="space-y-4">
                {broadcasts.map((broadcast) => (
                  <div key={broadcast.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-medium">{broadcast.name}</h3>
                        <p className="text-gray-400 text-sm">{new Date(broadcast.createdAt).toLocaleString()}</p>
                      </div>
                      {getStatusBadge(broadcast.status)}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{broadcast.message.substring(0, 100)}...</p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-green-400">Sent: {broadcast.sentCount}</span>
                      <span className="text-blue-400">Delivered: {broadcast.deliveredCount}</span>
                      <span className="text-red-400">Failed: {broadcast.failedCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}