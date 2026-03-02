'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Globe, Bell, LogOut, Lock, User, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Profile } from '@/types';
import { CURRENCIES } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Topbar from '@/components/Topbar';
import { useNotifications } from '@/components/NotificationsContext';

interface Props { profile: Profile | null; orgName: string; orgId: string | null; }

interface NotifPrefs {
    renewal_alerts: boolean;
    expiry_alerts: boolean;
    member_changes: boolean;
}

const DEFAULT_PREFS: NotifPrefs = { renewal_alerts: true, expiry_alerts: true, member_changes: false };

export default function SettingsClient({ profile, orgName, orgId }: Props) {
    const { openPanel } = useNotifications();
    const supabase = createClient();
    const router = useRouter();
    const { t } = useLanguage();

    // ── Profile
    const [name, setName] = useState(profile?.full_name ?? '');
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');

    // ── Org
    const [org, setOrg] = useState(orgName);
    const [currency, setCurrency] = useState('USD');
    const [logoUrl, setLogoUrl] = useState('');

    // ── Notification prefs (persisted)
    const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
    const [notifSaving, setNotifSaving] = useState(false);
    const [notifSaved, setNotifSaved] = useState(false);

    // ── Save / error state
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // ── Password
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pwSaving, setPwSaving] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSaved, setPwSaved] = useState(false);

    // Load org data (currency + logo) on mount
    useEffect(() => {
        if (!orgId) return;
        supabase
            .from('organizations')
            .select('logo_url, currency')
            .eq('id', orgId)
            .single()
            .then(({ data }: any) => {
                if (data?.logo_url) setLogoUrl(data.logo_url);
                if (data?.currency) setCurrency(data.currency);
            });
    }, [orgId, supabase]);

    // Load notification prefs from profile on mount
    useEffect(() => {
        if (!profile?.id) return;
        supabase
            .from('profiles')
            .select('notification_prefs')
            .eq('id', profile.id)
            .single()
            .then(({ data }: any) => {
                if (data?.notification_prefs) {
                    setNotifPrefs({ ...DEFAULT_PREFS, ...data.notification_prefs });
                }
            });
    }, [profile?.id, supabase]);

    // ── File upload helper
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucket: string): Promise<string | null> => {
        const file = e.target.files?.[0];
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${profile?.id}/${fileName}`;
        setSaving(true); setError('');
        try {
            const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            setSaving(false);
            return data.publicUrl;
        } catch (err: any) {
            setError(err.message ?? 'Error uploading file');
            setSaving(false);
            return null;
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await handleFileUpload(e, 'avatars');
        if (url) {
            setAvatarUrl(url);
            await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile!.id);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await handleFileUpload(e, 'logos');
        if (url && orgId && profile?.role === 'admin') {
            setLogoUrl(url);
            await supabase.from('organizations').update({ logo_url: url }).eq('id', orgId);
        }
    };

    // ── Save profile + org (including currency)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: name })
                .eq('id', profile!.id);
            if (profileError) throw new Error(profileError.message);

            if (profile?.role === 'admin' && orgId) {
                const { error: orgError } = await supabase
                    .from('organizations')
                    .update({ name: org, currency })
                    .eq('id', orgId);
                if (orgError) throw new Error(orgError.message);
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
            router.refresh();
        } catch (err: any) {
            setError(err.message ?? 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // ── Save notification prefs
    const handleNotifSave = async () => {
        if (!profile?.id) return;
        setNotifSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({ notification_prefs: notifPrefs })
            .eq('id', profile.id);
        setNotifSaving(false);
        if (!error) {
            setNotifSaved(true);
            setTimeout(() => setNotifSaved(false), 2500);
        }
    };

    const togglePref = (key: keyof NotifPrefs) => {
        setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // ── Password change
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError('');
        if (newPw !== confirmPw) { setPwError(t('settings_pw_match_error')); return; }
        if (newPw.length < 6) { setPwError(t('settings_pw_min_error')); return; }
        setPwSaving(true);
        const { error } = await supabase.auth.updateUser({ password: newPw });
        setPwSaving(false);
        if (error) {
            setPwError(error.message);
        } else {
            setPwSaved(true);
            setNewPw(''); setConfirmPw('');
            setTimeout(() => setPwSaved(false), 2500);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const NOTIF_ROWS: { key: keyof NotifPrefs; label: string; desc: string }[] = [
        { key: 'renewal_alerts', label: t('settings_notif_renewal'), desc: t('settings_notif_renewal_desc') },
        { key: 'expiry_alerts', label: t('settings_notif_expiry'), desc: t('settings_notif_expiry_desc') },
        { key: 'member_changes', label: t('settings_notif_member'), desc: t('settings_notif_member_desc') },
    ];

    return (
        <div>
            <Topbar title={t('settings_title')} onToggleNotifications={openPanel}>
                {saved && <span className="badge badge-green">{t('settings_saved')}</span>}
            </Topbar>

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
                            <div className="icon-wrap" style={{ background: 'var(--color-purple-bg)', overflow: 'hidden', position: 'relative' }}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={20} color="var(--color-purple)" />
                                )}
                                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} title="Change Avatar" />
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
                            <div className="icon-wrap" style={{ background: 'var(--color-blue-bg)', overflow: 'hidden', position: 'relative' }}>
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Org Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Globe size={20} color="var(--color-blue)" />
                                )}
                                {profile?.role === 'admin' && (
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} title="Change Org Logo" />
                                )}
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
                                <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)} disabled={profile?.role !== 'admin'}>
                                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                                </select>
                                {profile?.role !== 'admin'
                                    ? <span className="form-hint">Only admins can change the organisation currency.</span>
                                    : <span className="form-hint">This affects how costs are displayed across the app. Saved with your profile.</span>
                                }
                            </div>
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

                {/* Notification Prefs — own save button */}
                <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="icon-wrap" style={{ background: 'var(--color-orange-bg)' }}>
                                <Bell size={20} color="var(--color-orange)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{t('settings_notifications')}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{t('settings_notifications_sub')}</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={handleNotifSave}
                            disabled={notifSaving}
                            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                            {notifSaved ? <><CheckCircle2 size={13} color="var(--color-green)" /> Saved</> : notifSaving ? 'Saving…' : 'Save preferences'}
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {NOTIF_ROWS.map(({ key, label, desc }) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{label}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{desc}</div>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                    <input
                                        type="checkbox"
                                        checked={notifPrefs[key]}
                                        onChange={() => togglePref(key)}
                                        style={{ width: 16, height: 16, accentColor: 'var(--color-accent)', cursor: 'pointer' }}
                                    />
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Integrations — redirect card */}
                <Link href="/dashboard/integrations" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ marginTop: 'var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-purple)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div className="icon-wrap" style={{ background: 'var(--color-purple-bg)' }}>
                                <Zap size={20} color="var(--color-purple)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{t('settings_integrations')}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Manage Slack, Telegram, Discord and more</div>
                            </div>
                        </div>
                        <ArrowRight size={18} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                    </div>
                </Link>

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
