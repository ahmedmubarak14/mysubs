'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Building2, Zap } from 'lucide-react';
import styles from '../login/auth.module.css';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function SignupPage() {
    const { t, isRTL } = useLanguage();
    const router = useRouter();
    const supabase = createClient();
    const [step, setStep] = useState<'credentials' | 'org'>('credentials');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [orgName, setOrgName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 'credentials') { setStep('org'); return; }
        setLoading(true);
        setError('');
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, org_name: orgName },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });
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

    return (
        <div className={styles.authPage} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={styles.authLeft}>
                <div className={styles.authBrand}>
                    <Link href="/">
                        <img src="/SubTrack/logo-white.png" alt="Subtrack" className="sidebar-logo-img" style={{ height: 32, width: 'auto', cursor: 'pointer' }} />
                    </Link>
                </div>
                <div className={styles.authHero}>
                    <h1 style={{ whiteSpace: 'pre-line' }}>{t('auth_hero_2_title')}</h1>
                    <p>{t('auth_hero_2_sub')}</p>
                    <div className={styles.authStats}>
                        <div className={styles.authStat}>
                            <span className={styles.authStatValue}>{t('auth_stat_4_val')}</span>
                            <span className={styles.authStatLabel}>{t('auth_stat_4_lab')}</span>
                        </div>
                        <div className={styles.authStat}>
                            <span className={styles.authStatValue}>{t('auth_stat_5_val')}</span>
                            <span className={styles.authStatLabel}>{t('auth_stat_5_lab')}</span>
                        </div>
                        <div className={styles.authStat}>
                            <span className={styles.authStatValue}>{t('auth_stat_6_val')}</span>
                            <span className={styles.authStatLabel}>{t('auth_stat_6_lab')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.authRight}>
                <div style={{ position: 'absolute', top: '10px', right: isRTL ? 'auto' : '10px', left: isRTL ? '10px' : 'auto', zIndex: 10 }}>
                    <LanguageSwitcher />
                </div>
                <div className={styles.authCard}>
                    <h2>{step === 'credentials' ? t('auth_create_account') : t('auth_name_workspace')}</h2>
                    <p className={styles.authSubtitle}>
                        {step === 'credentials'
                            ? t('auth_signup_sub_1')
                            : t('auth_signup_sub_2')}
                    </p>

                    {error && <div className={styles.authError}>{error}</div>}

                    {step === 'credentials' && (
                        <>
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
                            </div>
                            <div className="divider-text">{t('auth_or')}</div>
                        </>
                    )}

                    <form onSubmit={handleSignup} className={styles.authForm}>
                        {step === 'credentials' ? (
                            <>
                                <div className="form-group">
                                    <label className="form-label">{t('auth_full_name')}</label>
                                    <div className={styles.inputWithIcon}>
                                        <User size={16} className={styles.inputIcon} />
                                        <input type="text" className="form-input" placeholder={t('auth_full_name_ph')} value={fullName}
                                            onChange={e => setFullName(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('auth_email_work')}</label>
                                    <div className={styles.inputWithIcon}>
                                        <Mail size={16} className={styles.inputIcon} />
                                        <input type="email" className="form-input" placeholder={t('auth_email_ph')} value={email}
                                            onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('auth_pw_label')}</label>
                                    <div className={styles.inputWithIcon}>
                                        <Lock size={16} className={styles.inputIcon} />
                                        <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder={t('auth_pw_min')}
                                            value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={{ paddingInlineEnd: '42px' }} />
                                        <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="form-group">
                                <label className="form-label">{t('auth_org_name')}</label>
                                <div className={styles.inputWithIcon}>
                                    <Building2 size={16} className={styles.inputIcon} />
                                    <input type="text" className="form-input" placeholder={t('auth_org_name_ph')} value={orgName}
                                        onChange={e => setOrgName(e.target.value)} required />
                                </div>
                                <span className="form-hint">{t('auth_org_hint')}</span>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? t('auth_creating') : step === 'credentials' ? t('auth_continue') : t('auth_create_btn')}
                        </button>

                        {step === 'org' && (
                            <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => setStep('credentials')}>
                                ← Back
                            </button>
                        )}
                    </form>

                    <p className={styles.authFooterLink}>
                        Already have an account? <a href="/login">Sign in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
