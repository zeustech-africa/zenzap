'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  lastContact?: string;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    tags: '',
  });
  const [saving, setSaving] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zenzap-backend.onrender.com';
  
  // Fetch contacts on load
  useEffect(() => {
    fetchContacts();
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
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveContact = async () => {
    if (!formData.phone.trim()) {
      alert('Phone number is required');
      return;
    }
    
    setSaving(true);
    
    const contactData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
    };
    
    try {
      let res;
      if (editingContact) {
        res = await fetch(`${API_URL}/api/contacts/${editingContact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(contactData),
        });
      } else {
        res = await fetch(`${API_URL}/api/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(contactData),
        });
      }
      
      if (res.ok) {
        resetModal();
        fetchContacts();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save contact');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteContact = async (contact: Contact) => {
    if (!confirm(`Delete ${contact.name || contact.phone}?`)) return;
    
    try {
      const res = await fetch(`${API_URL}/api/contacts/${contact.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        fetchContacts();
      } else {
        alert('Failed to delete contact');
      }
    } catch (error) {
      alert('Network error');
    }
  };
  
  const openAddModal = () => {
    setEditingContact(null);
    setFormData({ name: '', phone: '', email: '', tags: '' });
    setShowModal(true);
  };
  
  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      tags: contact.tags.join(', '),
    });
    setShowModal(true);
  };
  
  const resetModal = () => {
    setShowModal(false);
    setEditingContact(null);
    setFormData({ name: '', phone: '', email: '', tags: '' });
  };
  
  const openWhatsAppChat = (phone: string) => {
    // Format phone number for WhatsApp (remove spaces, ensure international format)
    const formattedPhone = phone.replace(/\s/g, '').replace(/^0/, '27');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };
  
  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-gray-400">Loading contacts...</div>
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
          <span className="text-white font-bold ml-4">Contacts</span>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">
        {/* Search and Add */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={openAddModal}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            + Add Contact
          </button>
        </div>
        
        {/* Contacts Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300">Name</th>
                  <th className="text-left p-4 text-gray-300">Phone</th>
                  <th className="text-left p-4 text-gray-300">Email</th>
                  <th className="text-left p-4 text-gray-300">Tags</th>
                  <th className="text-left p-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-400">
                      No contacts found. Click "+ Add Contact" to add one.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-t border-white/10">
                      <td className="p-4 text-white">{contact.name || '-'}</td>
                      <td className="p-4 text-gray-300">{contact.phone}</td>
                      <td className="p-4 text-gray-300">{contact.email || '-'}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags?.map((tag, idx) => (
                            <span key={idx} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openWhatsAppChat(contact.phone)}
                            className="text-green-400 hover:text-green-300 text-sm"
                            title="Message on WhatsApp"
                          >
                            💬 Message
                          </button>
                          <button
                            onClick={() => openEditModal(contact)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Add/Edit Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-xl p-6 max-w-md w-full border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., 27721234567"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-1">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="lead, customer, vip (comma separated)"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveContact}
                disabled={saving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={resetModal}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg"
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