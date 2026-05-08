'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'af' | 'zu' | 'xh';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  'dashboard': { en: 'Dashboard', af: 'Paneel', zu: 'Ideshibhodi', xh: 'Ideshibhodi' },
  'inbox': { en: 'Inbox', af: 'Posbus', zu: 'Ibhokisi yokungenayo', xh: 'Ibhokisi engenayo' },
  'contacts': { en: 'Contacts', af: 'Kontakte', zu: 'Oxhumana nabo', xh: 'Abafowethu' },
  'settings': { en: 'Settings', af: 'Instellings', zu: 'Izilungiselelo', xh: 'Isetingi' },
  'analytics': { en: 'Analytics', af: 'Analise', zu: 'Ukuhlaziywa', xh: 'Uhlalutyo' },
  'leads': { en: 'Leads', af: 'Leie', zu: 'Amaholo', xh: 'Izikhokelo' },
  'subscription': { en: 'Subscription', af: 'Subskripsie', zu: 'Ukubhaliselwe', xh: 'Umbhaliso' },
  'logout': { en: 'Logout', af: 'Teken uit', zu: 'Phuma', xh: 'Phuma' },
  'save': { en: 'Save', af: 'Stoor', zu: 'Gcina', xh: 'Gcina' },
  'cancel': { en: 'Cancel', af: 'Kanselleer', zu: 'Khansela', xh: 'Rhoxisa' },
  'send': { en: 'Send', af: 'Stuur', zu: 'Thumela', xh: 'Thumela' },
  'type_message': { en: 'Type your message...', af: 'Tik jou boodskap...', zu: 'Bhala umlayezo wakho...', xh: 'Bhala umyalezo wakho...' },
  'search': { en: 'Search', af: 'Soek', zu: 'Sesha', xh: 'Khangela' },
};

const LanguageContext = createContext({
  language: 'en' as Language,
  setLanguage: (lang: Language) => {},
  t: (key: string) => key
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);