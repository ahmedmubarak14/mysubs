'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Globe, Bell, LogOut, Lock, User, Plug } from 'lucide-react';
import type { Profile } from '@/types';
import { CURRENCIES } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Topbar from '@/components/Topbar';
import { useNotifications } from '@/components/NotificationsContext';

interface Props { profile: Profile | null; orgName: string; orgId: string | null; }

// Brand SVG icons for integrations
const SlackIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A" />
        <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
        <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0" />
        <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
        <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D" />
        <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
        <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E" />
        <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E" />
    </svg>
);

const TelegramIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#2CA5E0" />
        <path d="M5.5 11.5l10-4-1.5 8.5-3-2.5-1.5 1.5.5-3 4-3.5-5 3-3.5-1z" fill="white" />
    </svg>
);

const DiscordIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" fill="#5865F2" />
    </svg>
);

export default function SettingsClient({ profile, orgName, orgId }: Props) {
    const { openPanel } = useNotifications();
    const supabase = createClient();
    const router = useRouter();
    const { t } = useLanguage();

    const [name, setName] = useState(profile?.full_name ?? '');
    const [org, setOrg] = useState(orgName);
    const [currency, setCurrency] = useState('USD');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set());

    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
    const [logoUrl, setLogoUrl] = useState(''); // Would ideally come from org data if we passed it

    // Fetch org details specifically for logo on load
    useEffect(() => {
        if (orgId) {
            supabase.from('organizations').select('logo_url').eq('id', orgId).single().then(({ data }: any) => {
                if (data?.logo_url) setLogoUrl(data.logo_url);
            });
        }
    }, [orgId, supabase]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucket: string): Promise<string | null> => {
        const file = e.target.files?.[0];
        if (!file) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${profile?.id}/${fileName}`;

        setSaving(true);
        setError('');
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
            setPwError(t('settings_pw_min_error'));
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
                            <div className="icon-wrap" style={{ background: 'var(--color-purple-bg)', overflow: 'hidden', padding: avatarUrl ? 0 : '', position: 'relative' }}>
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
                            <div className="icon-wrap" style={{ background: 'var(--color-blue-bg)', overflow: 'hidden', padding: logoUrl ? 0 : '', position: 'relative' }}>
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

                    {/* Integrations */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-5)' }}>
                            <div className="icon-wrap" style={{ background: 'var(--color-purple-bg)' }}>
                                <Plug size={20} color="var(--color-purple)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{t('settings_integrations')}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{t('settings_integrations_sub')}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {[
                                { id: 'slack', Icon: SlackIcon, labelKey: 'settings_int_slack' as const, descKey: 'settings_int_slack_desc' as const },
                                { id: 'telegram', Icon: TelegramIcon, labelKey: 'settings_int_telegram' as const, descKey: 'settings_int_telegram_desc' as const },
                                { id: 'discord', Icon: DiscordIcon, labelKey: 'settings_int_discord' as const, descKey: 'settings_int_discord_desc' as const },
                            ].map(({ id, Icon, labelKey, descKey }) => {
                                const connected = connectedIntegrations.has(id);
                                return (
                                    <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Icon />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 14 }}>{t(labelKey)}</div>
                                                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{t(descKey)}</div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setConnectedIntegrations(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(id)) next.delete(id); else next.add(id);
                                                    return next;
                                                });
                                            }}
                                            style={{
                                                padding: '6px 16px',
                                                borderRadius: 8,
                                                border: connected ? '1.5px solid var(--color-green)' : '1.5px solid var(--color-purple)',
                                                background: connected ? 'var(--color-green-bg)' : 'var(--color-purple-bg)',
                                                color: connected ? 'var(--color-green)' : 'var(--color-purple)',
                                                fontSize: 13,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                whiteSpace: 'nowrap',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {connected ? t('settings_int_disconnect') : t('settings_int_connect')}
                                        </button>
                                    </div>
                                );
                            })}
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
