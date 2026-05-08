'use client';

import { useState, useEffect } from 'react';

interface TutorialStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export default function TutorialTooltip() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0 });

  const steps: TutorialStep[] = [
    { id: 'inbox', target: '[href="/dashboard/inbox"]', title: '📬 Message Inbox', description: 'See all customer messages here. Click to reply.', position: 'right' },
    { id: 'broadcast', target: '[href="/dashboard/broadcast"]', title: '📢 Broadcast', description: 'Send one message to many customers at once.', position: 'right' },
    { id: 'contacts', target: '[href="/dashboard/contacts"]', title: '👥 Contacts', description: 'Your customer list. Add notes and tags.', position: 'right' },
    { id: 'auto-replies', target: '[href="/dashboard/auto-replies"]', title: '🤖 Auto-Replies', description: 'Set automatic answers for common questions like "price" or "hours".', position: 'right' },
    { id: 'booking', target: '[href="/dashboard/booking"]', title: '📅 Bookings', description: 'Manage customer appointments and send reminders.', position: 'right' },
    { id: 'leads', target: '[href="/dashboard/leads"]', title: '🎯 Leads', description: 'Track potential customers and convert them.', position: 'right' }
  ];

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      // Position the tooltip after a short delay to let DOM render
      setTimeout(updateTargetPosition, 500);
    }
  }, []);

  useEffect(() => {
    if (showTutorial) {
      updateTargetPosition();
    }
  }, [currentStep, showTutorial]);

  const updateTargetPosition = () => {
    const element = document.querySelector(steps[currentStep]?.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
    }
  };

  const nextStep = () => {
    if (currentStep + 1 < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTutorial(false);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  if (!showTutorial) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40"></div>

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-gradient-to-r from-purple-900 to-orange-800 rounded-xl p-4 shadow-2xl border border-orange-500 max-w-xs"
        style={{
          top: targetPosition.top - 80,
          left: targetPosition.left + 50
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-bold">{steps[currentStep]?.title}</h3>
          <button onClick={skipTutorial} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <p className="text-gray-300 text-sm mb-3">{steps[currentStep]?.description}</p>
        <div className="flex justify-between items-center">
          <div className="text-gray-500 text-xs">
            Step {currentStep + 1} of {steps.length}
          </div>
          <button onClick={nextStep} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded-lg text-sm">
            Next →
          </button>
        </div>
      </div>
    </>
  );
}