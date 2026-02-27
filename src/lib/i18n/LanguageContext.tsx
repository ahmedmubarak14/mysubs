'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Lang, TranslationKey } from './translations';

interface LanguageContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (key: TranslationKey) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'en',
    setLang: () => { },
    t: (key) => key,
    isRTL: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('en');

    useEffect(() => {
        const stored = localStorage.getItem('subtrack_lang') as Lang | null;
        if (stored === 'ar' || stored === 'en') {
            setLangState(stored);
        }
    }, []);

    const setLang = (newLang: Lang) => {
        setLangState(newLang);
        localStorage.setItem('subtrack_lang', newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
    };

    useEffect(() => {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    }, [lang]);

    const t = (key: TranslationKey): string => {
        return translations[lang][key] ?? translations.en[key] ?? key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, isRTL: lang === 'ar' }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
