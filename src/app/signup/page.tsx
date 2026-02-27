'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Building2, Zap } from 'lucide-react';
import styles from '../login/auth.module.css';

export default function SignupPage() {
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
        <div className={styles.authPage}>
            <div className={styles.authLeft}>
                <div className={styles.authBrand}>
                    <img src="/mysubs/logo.png" alt="Subtrack" className="sidebar-logo-img" style={{ height: 32, width: 'auto' }} />
                </div>
                <div className={styles.authHero}>
                    <h1>30 seconds to set up.<br />Hours saved every month.</h1>
                    <p>Join teams that track every subscription, every renewal, and every dollar spent on SaaS.</p>
                    <div className={styles.authStats}>
                        <div className={styles.authStat}>
                            <span className={styles.authStatValue}>Free</span>
                            <span className={styles.authStatLabel}>to get started</span>
                        </div>
                        <div className={styles.authStat}>
                            <span className={styles.authStatValue}>1 min</span>
                            <span className={styles.authStatLabel}>to add first sub</span>
                        </div>
                        <div className={styles.authStat}>
                            <span className={styles.authStatValue}>∞</span>
                            <span className={styles.authStatLabel}>subscriptions tracked</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.authRight}>
                <div className={styles.authCard}>
                    <h2>{step === 'credentials' ? 'Create your account' : 'Name your workspace'}</h2>
                    <p className={styles.authSubtitle}>
                        {step === 'credentials'
                            ? 'Start tracking your team subscriptions today'
                            : "This is your organization's Subtrack workspace"}
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
                                    Continue with Google
                                </button>
                            </div>
                            <div className="divider-text">or</div>
                        </>
                    )}

                    <form onSubmit={handleSignup} className={styles.authForm}>
                        {step === 'credentials' ? (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Full name</label>
                                    <div className={styles.inputWithIcon}>
                                        <User size={16} className={styles.inputIcon} />
                                        <input type="text" className="form-input" placeholder="Ahmed Al-Mubaraks" value={fullName}
                                            onChange={e => setFullName(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Work email</label>
                                    <div className={styles.inputWithIcon}>
                                        <Mail size={16} className={styles.inputIcon} />
                                        <input type="email" className="form-input" placeholder="you@company.com" value={email}
                                            onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <div className={styles.inputWithIcon}>
                                        <Lock size={16} className={styles.inputIcon} />
                                        <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Min. 8 characters"
                                            value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={{ paddingRight: '42px' }} />
                                        <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="form-group">
                                <label className="form-label">Organization / Company name</label>
                                <div className={styles.inputWithIcon}>
                                    <Building2 size={16} className={styles.inputIcon} />
                                    <input type="text" className="form-input" placeholder="Acme Corp" value={orgName}
                                        onChange={e => setOrgName(e.target.value)} required />
                                </div>
                                <span className="form-hint">Your team members will join this workspace.</span>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Creating account…' : step === 'credentials' ? 'Continue →' : 'Create Workspace'}
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
