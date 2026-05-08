'use client';

import { useState } from 'react';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ticketCreated, setTicketCreated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create support ticket
      const response = await fetch('http://localhost:5001/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user', // In production, get from auth
          businessId: 'default',
          subject: subject || 'General Support Request',
          message: `${name} (${email}): ${message}`
        })
      });
      
      if (response.ok) {
        setTicketCreated(true);
        setTimeout(() => {
          setIsOpen(false);
          setTicketCreated(false);
          setMessage('');
          setSubject('');
          setName('');
          setEmail('');
        }, 3000);
      }
    } catch (error) {
      alert('Failed to send message. Please try again.');
    }
  };

  const triggerButtonId = 'support-widget-trigger';

  return (
    <>
      {/* Floating Support Button */}
      <button
        id={triggerButtonId}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white w-14 h-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center text-2xl"
      >
        💬
      </button>

      {/* Support Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-4 border-b border-white/20 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">24/7 Support</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-2xl">
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {ticketCreated ? (
                <div className="text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-white font-bold mb-2">Ticket Created!</h3>
                  <p className="text-gray-300 text-sm">Our support team will respond within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => window.open('https://wa.me/27712345678', '_blank')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      💬 WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => window.location.href = 'mailto:support@zenzap.com'}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      📧 Email
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-gray-400">Or create a ticket</span>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject (optional)"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  />
                  <textarea
                    placeholder="How can we help you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}