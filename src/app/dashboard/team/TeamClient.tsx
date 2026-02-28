'use client';

import { useState } from 'react';
import { Users, Shield, Eye, BarChart2, X, Mail, TrendingUp, Upload, Trash2, Edit2, CheckSquare } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import { APP_CATALOG, getLogoUrl } from '@/lib/appCatalog';
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

    // Bulk Management State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBulkRole, setShowBulkRole] = useState(false);
    const [bulkRoleValue, setBulkRoleValue] = useState<'viewer' | 'manager' | 'admin'>('viewer');
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);
    const [showCsvModal, setShowCsvModal] = useState(false);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [bulkAlert, setBulkAlert] = useState({ message: '', type: '' });

    const toggleSelectAll = () => {
        if (selectedIds.size === members.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(members.map(m => m.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to remove ${selectedIds.size} users?`)) return;
        setIsProcessingBulk(true);
        const supabase = createClient();
        for (const id of selectedIds) {
            if (id === currentProfile?.id) continue;
            await supabase.from('profiles').delete().eq('id', id);
        }
        setIsProcessingBulk(false);
        setSelectedIds(new Set());
        window.location.reload();
    };

    const handleBulkRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessingBulk(true);
        const supabase = createClient();
        for (const id of selectedIds) {
            if (id === currentProfile?.id) continue;
            await supabase.from('profiles').update({ role: bulkRoleValue }).eq('id', id);
        }
        setIsProcessingBulk(false);
        setShowBulkRole(false);
        setSelectedIds(new Set());
        window.location.reload();
    };

    const handleCsvUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!csvFile || !orgId) return;
        setIsProcessingBulk(true);
        setBulkAlert({ message: '', type: '' });

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            // Support comma or semicolon delimited CSV, split by line
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

            let successCount = 0;
            const supabase = createClient();

            // Skip header row if it contains 'email'
            const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;

            for (let i = startIndex; i < lines.length; i++) {
                const cols = lines[i].split(/[,;]/).map(c => c.trim());
                const email = cols[0];
                let role = cols[1]?.toLowerCase();
                if (!['admin', 'manager', 'viewer'].includes(role)) role = 'viewer';

                if (email && email.includes('@')) {
                    const { error } = await supabase.functions.invoke('invite-user', {
                        body: { email, role, orgId }
                    });
                    if (!error) successCount++;
                }
            }

            setIsProcessingBulk(false);
            if (successCount > 0) {
                setBulkAlert({ message: `Successfully invited ${successCount} users from CSV.`, type: 'success' });
                setShowCsvModal(false);
                setCsvFile(null);
            } else {
                setBulkAlert({ message: 'No valid invites could be sent. Ensure format is: email,role', type: 'error' });
            }
        };
        reader.readAsText(csvFile);
    };

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
            const supabase = createClient();
            const { data, error: fnError } = await supabase.functions.invoke('invite-user', {
                body: { email: inviteEmail, role: inviteRole, orgId }
            });

            if (fnError || data?.error) {
                throw new Error(fnError?.message || data?.error || 'Invite failed');
            }

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
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-secondary" onClick={() => setShowCsvModal(true)}>
                            <Upload size={16} /> Bulk CSV
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
                            <Users size={16} /> {t('team_invite')}
                        </button>
                    </div>
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

                {/* Member Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {bulkAlert.message && (
                        <div style={{ padding: '16px 20px', background: bulkAlert.type === 'error' ? 'var(--color-red-bg)' : 'var(--color-green-bg)', color: bulkAlert.type === 'error' ? 'var(--color-red)' : 'var(--color-green)', borderBottom: '1px solid var(--color-border)', fontSize: 13, fontWeight: 600 }}>
                            {bulkAlert.message}
                            <button className="btn btn-ghost btn-sm" style={{ float: 'right', marginTop: -4 }} onClick={() => setBulkAlert({ message: '', type: '' })}><X size={14} /></button>
                        </div>
                    )}

                    {selectedIds.size > 0 && (
                        <div style={{ padding: '12px 20px', background: 'var(--color-purple-bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-purple)' }}>
                            <div style={{ fontWeight: 700, color: 'var(--color-purple)', fontSize: 14 }}>
                                {selectedIds.size} user{selectedIds.size !== 1 ? 's' : ''} selected
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn btn-secondary btn-sm" onClick={() => setShowBulkRole(true)} disabled={isProcessingBulk}>
                                    <Edit2 size={14} /> Edit Roles
                                </button>
                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-red)', background: 'var(--color-red-bg)' }} onClick={handleBulkDelete} disabled={isProcessingBulk}>
                                    <Trash2 size={14} /> Remove Selected
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    {isAdmin && (
                                        <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === members.length && members.length > 0} onChange={toggleSelectAll} style={{ accentColor: 'var(--color-purple)' }} /></th>
                                    )}
                                    <th>User Name</th>
                                    <th>Role</th>
                                    <th>Apps Managed</th>
                                    <th>Monthly Spend Impact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map(member => {
                                    const stats = getMemberStats(member.id);
                                    const initials = member.full_name?.split(' ').map(n => n?.[0] || '').join('').toUpperCase().slice(0, 2) || member.email?.[0]?.toUpperCase() || '?';
                                    const isYou = member.id === currentProfile?.id;
                                    return (
                                        <tr key={member.id} style={{ background: selectedIds.has(member.id) ? 'var(--color-purple-bg)' : undefined }}>
                                            {isAdmin && (
                                                <td><input type="checkbox" checked={selectedIds.has(member.id)} onChange={() => toggleSelect(member.id)} style={{ accentColor: 'var(--color-purple)' }} /></td>
                                            )}
                                            <td data-label="User Name">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{
                                                        width: 40, height: 40, borderRadius: '50%',
                                                        background: isYou ? 'var(--color-purple-bg)' : 'var(--color-bg-secondary)',
                                                        color: isYou ? 'var(--color-purple)' : 'var(--color-text-secondary)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 800, fontSize: 15, flexShrink: 0
                                                    }}>
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            {member.full_name || member.email?.split('@')[0] || 'Unknown'}
                                                            {isYou && <span className="badge badge-purple" style={{ fontSize: 10, padding: '2px 6px' }}>{t('team_you_badge')}</span>}
                                                        </div>
                                                        {member.full_name && <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{member.email}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td data-label="Role">
                                                <span className={`badge ${member.role === 'admin' ? 'badge-purple' : member.role === 'manager' ? 'badge-blue' : 'badge-gray'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                    {roleIcon(member.role)}
                                                    {member.role === 'admin' ? t('team_role_admin_display') : member.role === 'manager' ? t('team_role_manager_display') : t('team_role_member_display')}
                                                </span>
                                            </td>
                                            <td data-label="Apps Managed">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{ fontWeight: 700, fontSize: 15 }}>{stats.subsCount}</span>
                                                    {stats.subsCount > 0 && (
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            {subscriptions.filter(s => s.owner_id === member.id).slice(0, 3).map((sub, i) => {
                                                                const catalogEntry = APP_CATALOG.find(c => c.name.toLowerCase() === sub.name.toLowerCase());
                                                                const fallbackDomain = catalogEntry ? catalogEntry.domain : `${sub.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
                                                                const computedLogoUrl = sub.logo_url || getLogoUrl(fallbackDomain);
                                                                return (
                                                                    <div key={sub.id || `sub-${i}`} style={{
                                                                        width: 26, height: 26, borderRadius: 6,
                                                                        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        marginLeft: i > 0 ? -10 : 0, zIndex: 3 - i,
                                                                        fontSize: 10, fontWeight: 800, color: 'var(--color-text-secondary)',
                                                                        overflow: 'hidden'
                                                                    }}>
                                                                        <img src={computedLogoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} onError={(e) => {
                                                                            const target = e.currentTarget; const parent = target.parentElement;
                                                                            if (parent) { parent.innerHTML = `<div style="width: 100%; height: 100%; background: var(--color-bg-secondary); display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--color-text-secondary); font-weight: 800">${sub.name?.[0] || '?'}</div>`; }
                                                                        }} />
                                                                    </div>
                                                                )
                                                            })}
                                                            {stats.subsCount > 3 && (
                                                                <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -10, zIndex: 0, fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)' }}>
                                                                    +{stats.subsCount - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td data-label="Monthly Spend Impact">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 15 }}>${stats.totalMonthly.toFixed(0)} <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>/mo</span></div>
                                                    {stats.totalMonthly > 0 && (
                                                        <span style={{ fontSize: 11, color: 'var(--color-green)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', background: 'var(--color-green-bg)', padding: '2px 6px', borderRadius: 4 }}>
                                                            <TrendingUp size={10} style={{ marginRight: 4 }} /> +{(Math.random() * 5).toFixed(1)}%
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {members.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-tertiary)' }}>
                                            No team members found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
            {/* Bulk Role Modal */}
            {showBulkRole && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowBulkRole(false); }}>
                    <div className="modal" style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <span className="modal-title">Bulk Change Roles</span>
                            <button className="modal-close" onClick={() => setShowBulkRole(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleBulkRole}>
                            <div className="modal-body">
                                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}>You are about to change the role for <strong>{selectedIds.size} users</strong>.</p>
                                <div className="form-group">
                                    <label className="form-label">New Role</label>
                                    <select className="form-select" value={bulkRoleValue} onChange={e => setBulkRoleValue(e.target.value as any)}>
                                        <option value="viewer">{t('team_role_viewer')}</option>
                                        <option value="manager">{t('team_role_manager')}</option>
                                        <option value="admin">{t('team_role_admin')}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkRole(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isProcessingBulk}>
                                    {isProcessingBulk ? 'Updating...' : 'Update Roles'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CSV Upload Modal */}
            {showCsvModal && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCsvModal(false); }}>
                    <div className="modal" style={{ maxWidth: 420 }}>
                        <div className="modal-header">
                            <span className="modal-title">Bulk Import via CSV</span>
                            <button className="modal-close" onClick={() => setShowCsvModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCsvUpload}>
                            <div className="modal-body">
                                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>Upload a CSV file with team members to bulk-invite them. The file should have columns for <strong>email</strong> and optionally <strong>role</strong> (admin, manager, viewer).</p>

                                <div className="form-group">
                                    <label className="form-label">CSV File</label>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={e => setCsvFile(e.target.files?.[0] || null)}
                                        className="form-input"
                                        style={{ padding: '8px 12px' }}
                                        required
                                    />
                                    {csvFile && <div style={{ fontSize: 12, marginTop: 8, color: 'var(--color-green)', fontWeight: 600 }}>Selected: {csvFile.name}</div>}
                                </div>

                                <div style={{ padding: 12, background: 'var(--color-bg-secondary)', borderRadius: 8, marginTop: 16 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, color: 'var(--color-text-tertiary)' }}>Example Format.csv</div>
                                    <code style={{ fontSize: 12, display: 'block', color: 'var(--color-text-secondary)' }}>
                                        email,role<br />
                                        dev@company.com,viewer<br />
                                        cto@company.com,admin
                                    </code>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCsvModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isProcessingBulk || !csvFile}>
                                    {isProcessingBulk ? 'Processing...' : 'Upload & Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
