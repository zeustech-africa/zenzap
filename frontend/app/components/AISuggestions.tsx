'use client';

import { useState, useEffect } from 'react';

interface AISuggestionsProps {
  customerMessage: string;
  onSelectSuggestion: (suggestion: string) => void;
}

interface Suggestion {
  text: string;
  sentiment: string;
  intent: string;
}

export default function AISuggestions({ customerMessage, onSelectSuggestion }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState<string>('');
  const [intent, setIntent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerMessage && customerMessage.length > 5) {
      fetchSuggestions();
    }
  }, [customerMessage]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: customerMessage })
      });
      
      const data = await response.json();
      setSuggestions(data.suggestedReplies || []);
      setSentiment(data.sentiment || '');
      setIntent(data.intent || '');
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/20 text-green-400';
      case 'negative': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (!customerMessage) return null;

  return (
    <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-white text-sm font-medium">🤖 AI Suggested Replies</h4>
        {sentiment && (
          <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor()}`}>
            {sentiment} • {intent}
          </span>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSuggestion(suggestion)}
              className="text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 px-3 py-1.5 rounded-full transition"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}