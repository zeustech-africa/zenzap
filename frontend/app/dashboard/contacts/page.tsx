'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastInteraction: string;
  tags: string[];
}

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts] = useState<Contact[]>([
    { id: '1', name: 'John Doe', phone: '+27 82 123 4567', email: 'john@example.com', lastInteraction: '2024-05-03', tags: ['lead', 'interested'] },
    { id: '2', name: 'Jane Smith', phone: '+27 83 234 5678', email: 'jane@example.com', lastInteraction: '2024-05-02', tags: ['customer', 'vip'] },
    { id: '3', name: 'Bob Johnson', phone: '+27 84 345 6789', email: 'bob@example.com', lastInteraction: '2024-05-01', tags: ['customer'] },
  ]);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition">
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
                  <th className="text-left p-4 text-gray-300">Last Interaction</th>
                  <th className="text-left p-4 text-gray-300">Tags</th>
                  <th className="text-left p-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="border-t border-white/10">
                    <td className="p-4 text-white">{contact.name}</td>
                    <td className="p-4 text-gray-300">{contact.phone}</td>
                    <td className="p-4 text-gray-300">{contact.email}</td>
                    <td className="p-4 text-gray-300">{contact.lastInteraction}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {contact.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <button className="text-orange-400 hover:text-orange-300 text-sm">Message</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}