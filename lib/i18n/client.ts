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
      
      // Set RTL direction for Arabic
      if (savedLocale === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  }, []);

  // Improved translation function that handles nested keys
  const t = useCallback((key: string, params: Record<string, any> = {}) => {
    const currentTranslations = translations[locale as keyof typeof translations] || translations.en;
    
    // Handle nested keys (e.g., "product.images")
    const parts = key.split('.');
    let value: any = currentTranslations;
    
    // Navigate through the nested structure
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        // Key not found in current translations, try in English as fallback
        if (locale !== 'en') {
          let englishValue: any = translations.en;
          let found = true;
          
          for (const p of parts) {
            if (englishValue && typeof englishValue === 'object' && p in englishValue) {
              englishValue = englishValue[p];
            } else {
              found = false;
              break;
            }
          }
          
          if (found) {
            value = englishValue;
          } else {
            // Not found in English either, return the key
            return key;
          }
        } else {
          // Already in English, just return the key
          return key;
        }
      }
    }
    
    // If we found a non-string value (e.g., an object), return the key
    if (typeof value !== 'string') {
      return key;
    }
    
    // Replace parameters in the translation string
    let translation = value;
    Object.keys(params).forEach(param => {
      translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
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