'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Building2, Globe, Bell, LogOut, Lock, User } from 'lucide-react';
import type { Profile } from '@/types';
import { CURRENCIES } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Props { profile: Profile | null; orgName: string; orgId: string | null; }

export default function SettingsClient({ profile, orgName, orgId }: Props) {
    const supabase = createClient();
    const router = useRouter();
    const { t } = useLanguage();

    const [name, setName] = useState(profile?.full_name ?? '');
    const [org, setOrg] = useState(orgName);
    const [currency, setCurrency] = useState('USD');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // Password change
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pwSaving, setPwSaving] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSaved, setPwSaved] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            // Update profile name
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: name })
                .eq('id', profile!.id);
            if (profileError) throw new Error(profileError.message);

            // Update org name if admin
            if (profile?.role === 'admin' && orgId) {
                const { error: orgError } = await supabase
                    .from('organizations')
                    .update({ name: org })
                    .eq('id', orgId);
                if (orgError) throw new Error(orgError.message);
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
            router.refresh(); // Re-fetch server components (sidebar name)
        } catch (err: any) {
            setError(err.message ?? 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError('');
        if (newPw !== confirmPw) {
            setPwError(t('settings_pw_match_error'));
            return;
        }
        if (newPw.length < 6) {
            setPwError('Password must be at least 6 characters');
            return;
        }
        setPwSaving(true);
        const { error } = await supabase.auth.updateUser({ password: newPw });
        setPwSaving(false);
        if (error) {
            setPwError(error.message);
        } else {
            setPwSaved(true);
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
            setTimeout(() => setPwSaved(false), 2500);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div>
            <div className="topbar">
                <span className="topbar-title">{t('settings_title')}</span>
                <div className="topbar-actions">
                    {saved && <span className="badge badge-green">{t('settings_saved')}</span>}
                </div>
            </div>

            <div className="page-content" style={{ maxWidth: 640 }}>
                {error && (
                    <div style={{ background: 'var(--color-red-bg)', color: 'var(--color-red)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {/* Profile */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-5)' }}>
                            <div className="icon-wrap" style={{ background: 'var(--color-purple-bg)' }}>
                                <User size={20} color="var(--color-purple)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{t('settings_profile')}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{t('settings_profile_sub')}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div className="form-group">
                                <label className="form-label">{t('settings_full_name')}</label>
                                <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('settings_email')}</label>
                                <input className="form-input" value={profile?.email ?? ''} disabled style={{ opacity: 0.6 }} />
                                <span className="form-hint">{t('settings_email_hint')}</span>
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('settings_role')}</label>
                                <input className="form-input" value={profile?.role ?? ''} disabled style={{ textTransform: 'capitalize', opacity: 0.6 }} />
                            </div>
                        </div>
                    </div>

                    {/* Organization */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-5)' }}>
                            <div className="icon-wrap" style={{ background: 'var(--color-blue-bg)' }}>
                                <Globe size={20} color="var(--color-blue)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{t('settings_org')}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{t('settings_org_sub')}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div className="form-group">
                                <label className="form-label">{t('settings_org_name')}</label>
                                <input className="form-input" value={org} onChange={e => setOrg(e.target.value)} disabled={profile?.role !== 'admin'} />
                                {profile?.role !== 'admin' && <span className="form-hint">{t('settings_org_admin_hint')}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('settings_currency')}</label>
                                <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-5)' }}>
                            <div className="icon-wrap" style={{ background: 'var(--color-orange-bg)' }}>
                                <Bell size={20} color="var(--color-orange)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{t('settings_notifications')}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{t('settings_notifications_sub')}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {[
                                { label: t('settings_notif_renewal'), desc: t('settings_notif_renewal_desc'), defaultOn: true },
                                { label: t('settings_notif_expiry'), desc: t('settings_notif_expiry_desc'), defaultOn: true },
                                { label: t('settings_notif_member'), desc: t('settings_notif_member_desc'), defaultOn: false },
                            ].map(({ label, desc, defaultOn }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{label}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{desc}</div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input type="checkbox" defaultChecked={defaultOn} style={{ width: 16, height: 16, accentColor: 'var(--color-accent)' }} />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button type="button" className="btn btn-secondary" onClick={handleLogout} style={{ color: 'var(--color-red)', borderColor: 'var(--color-red)' }}>
                            <LogOut size={16} /> {t('settings_signout')}
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? t('settings_saving') : t('settings_save')}
                        </button>
                    </div>
                </form>

                {/* Password Change */}
                <form onSubmit={handlePasswordChange} style={{ marginTop: 'var(--space-6)' }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-5)' }}>
                            <div className="icon-wrap" style={{ background: '#F3F0FF' }}>
                                <Lock size={20} color="var(--color-purple)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{t('settings_password')}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{t('settings_password_sub')}</div>
                            </div>
                        </div>
                        {pwError && <div style={{ background: 'var(--color-red-bg)', color: 'var(--color-red)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>{pwError}</div>}
                        {pwSaved && <div style={{ background: 'var(--color-green-bg)', color: 'var(--color-green)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>{t('settings_saved')}</div>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div className="form-group">
                                <label className="form-label">{t('settings_new_pw')}</label>
                                <input className="form-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('settings_confirm_pw')}</label>
                                <input className="form-input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                            </div>
                        </div>
                        <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-secondary" disabled={pwSaving}>
                                {pwSaving ? t('settings_saving') : t('settings_password')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
