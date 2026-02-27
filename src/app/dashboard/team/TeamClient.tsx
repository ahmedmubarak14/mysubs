'use client';

import { useState } from 'react';
import { Users, Shield, Eye, BarChart2, X, Mail, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Profile, Subscription } from '@/types';
import Topbar from '@/components/Topbar';
import { useNotifications } from '@/components/NotificationsContext';

interface Props {
    members: Profile[];
    subscriptions: Subscription[];
    currentProfile: Profile | null;
    orgId: string | undefined;
}

export default function TeamClient({ members, subscriptions, currentProfile, orgId }: Props) {
    const { openPanel } = useNotifications();
    const { t } = useLanguage();
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'viewer' | 'manager' | 'admin'>('viewer');
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');

    const isAdmin = currentProfile?.role === 'admin';

    const getMemberStats = (memberId: string) => {
        const owned = subscriptions.filter(s => s.owner_id === memberId);
        const totalMonthly = owned.reduce((sum, s) => {
            const cost = s.cost || 0;
            if (s.billing_cycle === 'yearly') return sum + cost / 12;
            if (s.billing_cycle === 'quarterly') return sum + cost / 3;
            return sum + cost;
        }, 0);
        const totalSeats = owned.reduce((sum, s) => sum + (s.seats || 0), 0);
        return { subsCount: owned.length, totalMonthly, totalSeats };
    };

    const roleIcon = (role: string) => {
        if (role === 'admin') return <Shield size={14} color="var(--color-purple)" />;
        if (role === 'manager') return <BarChart2 size={14} color="var(--color-blue)" />;
        return <Eye size={14} color="var(--color-text-tertiary)" />;
    };

    const roleColor = (role: string) => {
        if (role === 'admin') return 'var(--color-purple)';
        if (role === 'manager') return 'var(--color-blue)';
        return 'var(--color-text-tertiary)';
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgId) return;
        setInviting(true);
        setInviteError('');
        setInviteSuccess('');
        try {
            const res = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole, orgId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Invite failed');
            setInviteSuccess(`Invitation sent to ${inviteEmail}! They'll receive an email to set their password.`);
            setInviteEmail('');
            setTimeout(() => { setShowInvite(false); setInviteSuccess(''); }, 3000);
        } catch (err: any) {
            setInviteError(err.message);
        } finally {
            setInviting(false);
        }
    };

    const adminCount = members.filter(m => m.role === 'admin').length;
    const managerCount = members.filter(m => m.role === 'manager').length;

    return (
        <div>
            <Topbar title={t('team_title')} onToggleNotifications={openPanel}>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
                        <Users size={16} /> {t('team_invite')}
                    </button>
                )}
            </Topbar>

            <div className="page-content">
                {/* Stats strip */}
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                    {[
                        { label: t('team_total'), value: members.length, color: 'var(--color-purple)' },
                        { label: t('team_admins'), value: adminCount, color: 'var(--color-orange)' },
                        { label: t('team_managers'), value: managerCount, color: 'var(--color-blue)' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="card" style={{ flex: 1, minWidth: 140, padding: 'var(--space-4)', textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Member cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                    {members.map(member => {
                        const stats = getMemberStats(member.id);
                        const initials = member.full_name?.split(' ').map(n => n?.[0] || '').join('').toUpperCase().slice(0, 2) || member.email?.[0]?.toUpperCase() || '?';
                        const isYou = member.id === currentProfile?.id;
                        return (
                            <div key={member.id} className="card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 20, background: 'rgba(255, 255, 255, 0.45)', overflow: 'hidden' }}>
                                {/* Decorative Glow */}
                                <div style={{ position: 'absolute', top: -30, left: -30, width: 120, height: 120, background: member.id === currentProfile?.id ? 'var(--color-purple)' : 'var(--color-accent)', filter: 'blur(50px)', opacity: 0.15, pointerEvents: 'none' }} />

                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 'var(--radius-xl)',
                                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0,
                                        boxShadow: 'var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.4)',
                                        position: 'relative'
                                    }}>
                                        {initials}
                                        {isAdmin && member.role === 'admin' && (
                                            <div style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--color-bg)', borderRadius: '50%', padding: 2 }}>
                                                <div style={{ background: 'var(--color-purple-bg)', color: 'var(--color-purple)', borderRadius: '50%', padding: 3, display: 'flex' }}>
                                                    <Shield size={10} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)' }}>
                                            {member.full_name || member.email?.split('@')[0] || 'Unknown'}
                                            {isYou && <span style={{ fontSize: 10, background: 'var(--color-purple-bg)', color: 'var(--color-purple)', padding: '2px 6px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.05em' }}>YOU</span>}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginTop: 4 }}>
                                            {member.role === 'admin' ? 'Workspace Admin' : member.role === 'manager' ? 'Team Lead' : 'Member'}
                                        </div>
                                    </div>
                                </div>

                                {/* Body / Stats Container */}
                                <div style={{ display: 'flex', gap: 12, zIndex: 1, marginTop: 'auto' }}>
                                    {/* Tools Owned Box inner glass */}
                                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.5)', padding: 12, borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: 6, boxShadow: 'inset 0 1px 0 rgba(255,255,255,1)' }}>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tools</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-primary)' }}>{stats.subsCount}</span>
                                            {stats.subsCount > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    {subscriptions.filter(s => s.owner_id === member.id).slice(0, 3).map((sub, i) => (
                                                        <div key={sub.id || `sub-${i}`} style={{
                                                            width: 24, height: 24, borderRadius: 6,
                                                            background: 'rgba(255,255,255,0.8)', border: '1px solid var(--color-border-glass)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i,
                                                            fontSize: 10, fontWeight: 800, color: 'var(--color-primary)',
                                                            boxShadow: 'var(--shadow-xs)', overflow: 'hidden'
                                                        }}>
                                                            {sub.logo_url ? <img src={sub.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} /> : (sub.name?.[0] || '?')}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Monthly Impact inner glass */}
                                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.5)', padding: 12, borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: 6, boxShadow: 'inset 0 1px 0 rgba(255,255,255,1)' }}>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spend</div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-primary)' }}>${stats.totalMonthly.toFixed(0)}</span>
                                            <span style={{ fontSize: 11, color: 'var(--color-green)', fontWeight: 700, display: 'flex', alignItems: 'center', background: 'var(--color-green-bg)', padding: '2px 6px', borderRadius: 4 }}>
                                                <TrendingUp size={10} style={{ marginRight: 4 }} /> +{(Math.random() * 5).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {/* Add Team Member Card */}
                    {isAdmin && (
                        <div onClick={() => setShowInvite(true)} style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            border: '2px dashed rgba(134, 77, 179, 0.3)', background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', cursor: 'pointer',
                            minHeight: 180, gap: 12, transition: 'all 0.2s', borderRadius: 'var(--radius-xl)'
                        }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.45)'; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(134, 77, 179, 0.3)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', boxShadow: 'var(--shadow-xs)' }}>
                                <Users size={24} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: 15 }}>Add Team Member</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>Invite a new user to your workspace</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Invite Modal */}
            {showInvite && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowInvite(false); }}>
                    <div className="modal" style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <span className="modal-title">{t('team_invite_title')}</span>
                            <button className="modal-close" onClick={() => setShowInvite(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleInvite}>
                            <div className="modal-body">
                                {inviteError && <div style={{ background: 'var(--color-red-bg)', color: 'var(--color-red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>{inviteError}</div>}
                                {inviteSuccess && <div style={{ background: 'var(--color-green-bg)', color: 'var(--color-green)', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>{inviteSuccess}</div>}

                                <div className="form-group">
                                    <label className="form-label">{t('team_invite_email')}</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                                        <input
                                            className="form-input"
                                            type="email"
                                            placeholder={t('team_invite_email_ph')}
                                            value={inviteEmail}
                                            onChange={e => setInviteEmail(e.target.value)}
                                            style={{ paddingLeft: 36 }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('team_invite_role')}</label>
                                    <select className="form-select" value={inviteRole} onChange={e => setInviteRole(e.target.value as any)}>
                                        <option value="viewer">{t('team_role_viewer')}</option>
                                        <option value="manager">{t('team_role_manager')}</option>
                                        <option value="admin">{t('team_role_admin')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowInvite(false)}>{t('team_invite_cancel')}</button>
                                <button type="submit" className="btn btn-primary" disabled={inviting}>
                                    {inviting ? t('team_invite_sending') : t('team_invite_send')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
