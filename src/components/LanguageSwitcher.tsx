'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LanguageSwitcher() {
    const { lang, setLang } = useLanguage();

    const toggleLanguage = () => {
        setLang(lang === 'en' ? 'ar' : 'en');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="btn btn-ghost btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}
            title={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
        >
            <span style={{ fontSize: '16px' }}>{lang === 'en' ? '🇸🇦' : '🇺🇸'}</span>
            {lang === 'en' ? 'العربية' : 'English'}
        </button>
    );
}
