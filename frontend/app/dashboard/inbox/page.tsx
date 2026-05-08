'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AISuggestions from '../../components/AISuggestions';

interface Conversation {
  id: string;
  customerName: string;
  customerNumber: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  status: 'new' | 'read' | 'resolved';
}

export default function InboxPage() {
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [latestCustomerMessage, setLatestCustomerMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessageNumber, setNewMessageNumber] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationsList, setConversationsList] = useState<Conversation[]>([]);
  
  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversationsList(data);
      }
    } catch (error) {
      // Fall back to mock data if API unavailable
      console.log('Using mock conversations');
    }
  };

  // Load mock conversations on mount
  useEffect(() => {
    const mockConversations: Conversation[] = [
      { id: '1', customerName: 'John Doe', customerNumber: '+27 82 123 4567', lastMessage: 'How much does the Pro plan cost?', lastMessageTime: '10:30 AM', unread: true, status: 'new' },
      { id: '2', customerName: 'Jane Smith', customerNumber: '+27 83 234 5678', lastMessage: 'I want to book an appointment', lastMessageTime: '9:15 AM', unread: true, status: 'new' },
      { id: '3', customerName: 'Bob Johnson', customerNumber: '+27 84 345 6789', lastMessage: 'Thanks for your help!', lastMessageTime: 'Yesterday', unread: false, status: 'resolved' },
      { id: '4', customerName: 'Alice Brown', customerNumber: '+27 85 456 7890', lastMessage: 'Do you offer discounts for yearly plans?', lastMessageTime: 'Yesterday', unread: false, status: 'read' },
    ];
    setConversationsList(mockConversations);
    fetchConversations();
  }, []);

  const selectedConv = conversationsList.find(c => c.id === selectedConversation);

  const sendNewMessage = async () => {
    if (!newMessageNumber || !newMessageText) {
      alert('Please enter both phone number and message');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: newMessageNumber,
          message: newMessageText
        })
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setShowNewMessage(false);
        setNewMessageNumber('');
        setNewMessageText('');
        fetchConversations();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('Failed to send message: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;
    
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedConv?.customerNumber,
          message: replyText
        })
      });
      
      if (response.ok) {
        setReplyText('');
        // Refresh conversation
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      alert('Error sending message');
    }
  };

  const handleQuickReply = (text: string) => {
    setReplyText(text);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        setAudioChunks(prev => [...prev, event.data]);
      };
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        // Send voice note via WhatsApp API
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-note.webm');
        formData.append('to', selectedConv?.customerNumber || '');
        await fetch('/api/messages/send-voice', { method: 'POST', body: formData });
        setAudioChunks([]);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Set latest customer message when conversation is selected
  useEffect(() => {
    if (selectedConv?.lastMessage) {
      setLatestCustomerMessage(selectedConv.lastMessage);
    } else {
      setLatestCustomerMessage('');
    }
  }, [selectedConversation, selectedConv?.lastMessage]);

  const quickReplies = [
    "Thank you for your message. How can I help you today?",
    "Our pricing starts at R299/month. Would you like a demo?",
    "Yes, we have a yearly plan with 2 months free!",
    "I'll have someone contact you shortly.",
    "You can book an appointment here: [link]"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
              ← Dashboard
            </Link>
            <span className="text-white font-bold">Message Inbox</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs">
              {conversationsList.filter(c => c.unread).length} unread
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/20 flex justify-between items-center">
              <h2 className="text-white font-bold">Conversations</h2>
              <button
                onClick={() => setShowNewMessage(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 text-sm"
              >
                ✨ New Message
              </button>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {conversationsList.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full text-left p-4 hover:bg-white/5 transition ${selectedConversation === conv.id ? 'bg-white/10' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-medium">{conv.customerName}</div>
                      <div className="text-gray-400 text-sm">{conv.customerNumber}</div>
                      <div className="text-gray-500 text-xs mt-1 truncate max-w-[200px]">{conv.lastMessage}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-xs">{conv.lastMessageTime}</div>
                      {conv.unread && (
                        <div className="mt-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex flex-col h-[600px]">
            {selectedConversation && selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/20">
                  <div className="text-white font-bold">{selectedConv.customerName}</div>
                  <div className="text-gray-400 text-sm">{selectedConv.customerNumber}</div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="text-center text-gray-500 text-sm mb-4">
                    {new Date().toLocaleDateString()}
                  </div>
                  <div className="flex justify-start mb-3">
                    <div className="bg-white/10 rounded-lg p-3 max-w-[70%]">
                      <p className="text-white text-sm">{selectedConv.lastMessage}</p>
                      <span className="text-gray-500 text-xs mt-1 block">{selectedConv.lastMessageTime}</span>
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                <AISuggestions 
                  customerMessage={latestCustomerMessage} 
                  onSelectSuggestion={(suggestion) => setReplyText(suggestion)} 
                />

                {/* Quick Replies */}
                <div className="px-4 py-2 border-t border-white/10">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded-full transition"
                      >
                        {reply.substring(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-white/20">
                  <div className="flex gap-2">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-2 rounded-lg transition ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      {isRecording ? '⏹️' : '🎤'}
                    </button>
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={handleSendReply}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a conversation to start replying
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-purple-900 to-orange-800 rounded-2xl max-w-md w-full p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-bold text-xl">New WhatsApp Message</h2>
              <button onClick={() => setShowNewMessage(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Recipient Number</label>
                <input
                  type="tel"
                  value={newMessageNumber}
                  onChange={(e) => setNewMessageNumber(e.target.value)}
                  placeholder="e.g., 27721234567"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
                <p className="text-gray-500 text-xs mt-1">Include country code (e.g., 27 for South Africa)</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Message</label>
                <textarea
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  rows={4}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>

              <button
                onClick={sendNewMessage}
                disabled={sending}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Message →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
