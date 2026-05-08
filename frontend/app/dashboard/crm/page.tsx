'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  totalInteractions: number;
  lastInteractionAt: string;
  status: string;
}

interface CustomerNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export default function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      const data = await response.json();
      setSelectedCustomer(data);
      
      const notesResponse = await fetch(`/api/customers/${customerId}/notes`);
      const notesData = await notesResponse.json();
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedCustomer) return;
    
    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, createdBy: 'Current User' })
      });
      
      if (response.ok) {
        const note = await response.json();
        setNotes([...notes, note]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const addTag = async () => {
    if (!newTag.trim() || !selectedCustomer) return;
    
    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: newTag })
      });
      
      if (response.ok) {
        const updated = await response.json();
        setSelectedCustomer(updated);
        setNewTag('');
        await fetchCustomers(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const removeTag = async (tag: string) => {
    if (!selectedCustomer) return;
    
    try {
      await fetch(`/api/customers/${selectedCustomer.id}/tags/${tag}`, {
        method: 'DELETE'
      });
      
      setSelectedCustomer({
        ...selectedCustomer,
        tags: selectedCustomer.tags.filter(t => t !== tag)
      });
      await fetchCustomers();
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'lead': return 'bg-yellow-500/20 text-yellow-400';
      case 'inactive': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Customer CRM</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer List */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
              <div className="p-4 border-b border-white/20">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => fetchCustomerDetails(customer.id)}
                    className={`w-full text-left p-4 hover:bg-white/5 transition ${selectedCustomer?.id === customer.id ? 'bg-white/10' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-white font-medium">{customer.name}</div>
                        <div className="text-gray-400 text-sm">{customer.phone}</div>
                        <div className="flex gap-1 mt-1">
                          {customer.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {customer.tags.length > 2 && (
                            <span className="text-xs text-gray-400">+{customer.tags.length - 2}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">{customer.totalInteractions} msgs</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="lg:col-span-2">
            {selectedCustomer ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedCustomer.name}</h2>
                    <p className="text-gray-400">{selectedCustomer.phone}</p>
                    {selectedCustomer.email && <p className="text-gray-400 text-sm">{selectedCustomer.email}</p>}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedCustomer.status)}`}>
                    {selectedCustomer.status}
                  </div>
                </div>

                {/* Tags Section */}
                <div className="mb-4">
                  <h3 className="text-white font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedCustomer.tags.map((tag) => (
                      <span key={tag} className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-orange-300 hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-1 px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    />
                    <button onClick={addTag} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm">
                      Add
                    </button>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="mb-4">
                  <h3 className="text-white font-semibold mb-2">Notes</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-white/5 rounded-lg p-3">
                        <p className="text-gray-300 text-sm">{note.content}</p>
                        <div className="text-gray-500 text-xs mt-1">{note.createdBy} · {new Date(note.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={2}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-gray-400"
                    />
                    <button onClick={addNote} className="bg-orange-500 hover:bg-orange-600 text-white px-4 rounded-lg transition">
                      Add
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{selectedCustomer.totalInteractions}</div>
                    <div className="text-gray-400 text-sm">Total Messages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{new Date(selectedCustomer.lastInteractionAt).toLocaleDateString()}</div>
                    <div className="text-gray-400 text-sm">Last Activity</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-12 text-center">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-white font-semibold text-lg">Select a Customer</h3>
                <p className="text-gray-400 mt-2">Click on any customer to view their details and interaction history.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}