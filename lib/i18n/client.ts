"use client";

import { useCallback, useEffect, useState } from "react";

// Define supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: "English", flag: "🇺🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  ar: { name: "العربية", flag: "🇸🇦" },
  zh: { name: "中文", flag: "🇨🇳" },
  ja: { name: "日本語", flag: "🇯🇵" },
  es: { name: "Español", flag: "🇪🇸" }
};

// Import all translations
import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import es from './locales/es.json';

const translations = {
  en,
  fr,
  ar,
  zh,
  ja,
  es
};

export function useTranslation() {
  const [locale, setLocale] = useState('en');
  
  // Load user's preferred locale from localStorage on client side
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && Object.keys(SUPPORTED_LANGUAGES).includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  // Translation function
  const t = useCallback((key: string, params: Record<string, string> = {}) => {
    const currentTranslations = translations[locale as keyof typeof translations] || translations.en;
    let translation = currentTranslations[key as keyof typeof currentTranslations] as string || key;
    
    // Replace parameters in the translation string
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, params[param]);
    });
    
    return translation;
  }, [locale]);

  // Function to change locale
  const changeLocale = useCallback((newLocale: string) => {
    if (Object.keys(SUPPORTED_LANGUAGES).includes(newLocale)) {
      localStorage.setItem('locale', newLocale);
      setLocale(newLocale);
      
      // For RTL languages like Arabic
      if (newLocale === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  }, []);

  return {
    t,
    locale,
    changeLocale
  };
}