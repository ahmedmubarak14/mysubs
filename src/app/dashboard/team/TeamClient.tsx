'use client';

import { useState } from 'react';
import { Users, Shield, Eye, BarChart2, X, Mail } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Profile, Subscription } from '@/types';

interface Props {
    members: Profile[];
    subscriptions: Subscription[];
    currentProfile: Profile | null;
    orgId: string | undefined;
}

export default function TeamClient({ members, subscriptions, currentProfile, orgId }: Props) {
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
            <div className="topbar">
                <span className="topbar-title">{t('team_title')}</span>
                {isAdmin && (
                    <div className="topbar-actions">
                        <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
                            <Users size={16} /> {t('team_invite')}
                        </button>
                    </div>
                )}
            </div>

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
                        const initials = member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || member.email[0].toUpperCase();
                        const isYou = member.id === currentProfile?.id;
                        return (
                            <div key={member.id} className="card" style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-purple))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0
                                    }}>{initials}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {member.full_name || member.email.split('@')[0]}
                                            {isYou && <span style={{ fontSize: 11, background: 'var(--color-purple-bg)', color: 'var(--color-purple)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>{t('team_you')}</span>}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: `${roleColor(member.role)}15`, color: roleColor(member.role), fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                                        {roleIcon(member.role)}
                                        {member.role}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                                    {[
                                        { label: t('team_subs'), value: stats.subsCount },
                                        { label: t('team_seats'), value: stats.totalSeats },
                                        { label: t('team_monthly'), value: `$${stats.totalMonthly.toFixed(0)}` },
                                    ].map(({ label, value }) => (
                                        <div key={label} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
                                            <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
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
