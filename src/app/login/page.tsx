'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Zap } from 'lucide-react';
import styles from './auth.module.css';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LoginPage() {
    const { t, isRTL } = useLanguage();
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    };

    const handleAppleLogin = async () => {
        setLoading(true);
        await supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    };

    return (
        <div className={styles.authPage} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={styles.authLeft}>
                <div className={styles.authBrand}>
                    <Link href="/">
                        <img src="/SubTrack/logo-white.png" alt="Subtrack" className="sidebar-logo-img" style={{ height: 32, width: 'auto', cursor: 'pointer' }} />
                    </Link>
                </div>
                <div className={styles.authHero}>
                    <h1 style={{ whiteSpace: 'pre-line' }}>{t('auth_hero_1_title')}</h1>
                    <p>{t('auth_hero_1_sub')}</p>
                    <div className={styles.authStats}>
                        <div className={styles.authStat}>
                            <span className={styles.authStatValue}>{t('auth_stat_1_val')}</span>
                            <span className={styles.authStatLabel}>{t('auth_stat_1_lab')}</span>
                        </div>
                        <div className={styles.authStat}>
                            <span className={styles.authStatValue}>{t('auth_stat_2_val')}</span>
                            <span className={styles.authStatLabel}>{t('auth_stat_2_lab')}</span>
                        </div>
                        <div className={styles.authStat}>
                            <span className={styles.authStatValue}>{t('auth_stat_3_val')}</span>
                            <span className={styles.authStatLabel}>{t('auth_stat_3_lab')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.authRight}>
                <div style={{ position: 'absolute', top: '10px', right: isRTL ? 'auto' : '10px', left: isRTL ? '10px' : 'auto', zIndex: 10 }}>
                    <LanguageSwitcher />
                </div>
                <div className={styles.authCard}>
                    <h2>{t('auth_welcome_back')}</h2>
                    <p className={styles.authSubtitle}>{t('auth_sign_in_sub')}</p>

                    {error && (
                        <div className={styles.authError}>{error}</div>
                    )}

                    <div className={styles.oauthButtons}>
                        <button className={`btn btn-secondary ${styles.oauthBtn}`} onClick={handleGoogleLogin} disabled={loading}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                                <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                            </svg>
                            {t('auth_google')}
                        </button>
                        <button className={`btn btn-secondary ${styles.oauthBtn}`} onClick={handleAppleLogin} disabled={loading}>
                            <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor">
                                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-151.1-99.1C172.7 724.5 116.1 620.5 116.1 521c0-169.4 110.6-258.8 219.5-258.8 61.5 0 112.9 40.8 149.8 40.8 35.3 0 91.7-43.2 160.5-43.2zm-105.2-99.4c35.3-41.8 59.2-99.1 59.2-156.4 0-8.1-.7-16.2-2.1-23-55.8 2.1-122.3 37.3-162.5 83.1-32.8 37.3-61 93.9-61 152.3 0 8.8 1.4 17.6 2.1 20.4 3.5.7 9.1 1.4 14.7 1.4 50.4 0 113.9-33.5 149.6-77.8z" />
                            </svg>
                            {t('auth_apple')}
                        </button>
                    </div>

                    <div className="divider-text">{t('auth_or')}</div>

                    <form onSubmit={handleEmailLogin} className={styles.authForm}>
                        <div className="form-group">
                            <label className="form-label">{t('auth_email_label')}</label>
                            <div className={styles.inputWithIcon}>
                                <Mail size={16} className={styles.inputIcon} />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder={t('auth_email_ph')}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{t('auth_pw_label')}</label>
                            <div className={styles.inputWithIcon}>
                                <Lock size={16} className={styles.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder={t('auth_pw_ph')}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={{ paddingInlineEnd: '42px' }}
                                />
                                <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? t('auth_signing_in') : t('auth_sign_in')}
                        </button>
                    </form>

                    <p className={styles.authFooterLink}>
                        {t('auth_no_account')}{' '}
                        <a href="/signup">{t('auth_create_workspace')}</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
