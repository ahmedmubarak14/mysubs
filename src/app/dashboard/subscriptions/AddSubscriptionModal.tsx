'use client';

import { useState, useMemo } from 'react';
import { X, Search, ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { SUBSCRIPTION_CATEGORIES, CURRENCIES } from '@/types';
import { APP_CATALOG, getLogoUrl, AppEntry } from '@/lib/appCatalog';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Subscription, Profile } from '@/types';

interface Props {
    onClose: () => void;
    subscription?: Subscription;
    teamMembers: Profile[];
    orgId: string;
}

const BILLING_CYCLES = ['monthly', 'yearly', 'quarterly', 'one-time'] as const;

function AppLogo({ domain, name }: { domain: string; name: string }) {
    const [failed, setFailed] = useState(false);
    const initials = name.slice(0, 2).toUpperCase();
    if (failed) {
        return (
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #864DB3, #5B2D8E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                {initials}
            </div>
        );
    }
    return (
        <img
            src={getLogoUrl(domain)}
            alt={name}
            width={40}
            height={40}
            style={{ borderRadius: 10, objectFit: 'contain', border: '1px solid var(--color-border)' }}
            onError={() => setFailed(true)}
        />
    );
}

export default function AddSubscriptionModal({ onClose, subscription, teamMembers, orgId }: Props) {
    const supabase = createClient();
    const router = useRouter();
    const { t } = useLanguage();
    const isEdit = !!subscription;

    const [step, setStep] = useState<'pick' | 'form'>(isEdit ? 'form' : 'pick');
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: subscription?.name ?? '',
        vendor: subscription?.vendor ?? '',
        domain: '',
        category: subscription?.category ?? 'Other',
        cost: subscription?.cost?.toString() ?? '',
        currency: subscription?.currency ?? 'USD',
        billing_cycle: subscription?.billing_cycle ?? 'monthly',
        start_date: subscription?.start_date ?? '',
        renewal_date: subscription?.renewal_date ?? '',
        seats: subscription?.seats?.toString() ?? '0',
        owner_id: subscription?.owner_id ?? '',
        status: subscription?.status ?? 'active',
        notes: subscription?.notes ?? '',
    });

    const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

    const filteredApps = useMemo(() => {
        const q = search.toLowerCase();
        return APP_CATALOG.filter(a =>
            a.name.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q) ||
            a.vendor.toLowerCase().includes(q)
        );
    }, [search]);

    const handlePickApp = (app: AppEntry | null) => {
        if (app) {
            setForm(f => ({
                ...f,
                name: app.name,
                vendor: app.vendor,
                domain: app.domain,
                category: app.category,
                seats: app.defaultSeats?.toString() ?? f.seats,
            }));
        }
        setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                name: form.name,
                vendor: form.vendor,
                logo_url: form.domain ? getLogoUrl(form.domain) : undefined,
                category: form.category,
                cost: parseFloat(form.cost) || 0,
                currency: form.currency,
                billing_cycle: form.billing_cycle,
                start_date: form.start_date || null,
                renewal_date: form.renewal_date,
                seats: parseInt(form.seats) || 0,
                owner_id: form.owner_id || null,
                status: form.status,
                notes: form.notes || null,
                org_id: orgId,
            };

            if (isEdit) {
                const { error } = await supabase.from('subscriptions').update(payload).eq('id', subscription.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('subscriptions').insert(payload);
                if (error) throw error;
            }

            router.refresh();
            onClose();
        } catch (err: any) {
            setError(err.message ?? 'Failed to save');
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal" style={{ maxWidth: step === 'pick' ? 700 : 560 }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {step === 'form' && !isEdit && (
                            <button type="button" onClick={() => setStep('pick')} className="btn btn-ghost" style={{ padding: '4px 8px' }}>
                                <ChevronLeft size={16} /> {t('modal_back')}
                            </button>
                        )}
                        <span className="modal-title">
                            {step === 'pick' ? t('modal_pick_app') : isEdit ? t('modal_edit_sub') : t('modal_add_sub')}
                        </span>
                    </div>
                    <button className="modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                {/* ── STEP 1: App Picker ── */}
                {step === 'pick' && (
                    <div style={{ padding: '0 var(--space-5) var(--space-5)' }}>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 16 }}>{t('modal_pick_subtitle')}</p>

                        {/* Search */}
                        <div style={{ position: 'relative', marginBottom: 16 }}>
                            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                            <input
                                className="form-input"
                                placeholder={t('modal_search_apps')}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: 36 }}
                                autoFocus
                            />
                        </div>

                        {/* Custom app tile */}
                        <div
                            onClick={() => handlePickApp(null)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                                border: '2px dashed var(--color-accent)', borderRadius: 12, cursor: 'pointer',
                                marginBottom: 16, background: 'var(--color-purple-bg)',
                                transition: 'all 0.15s'
                            }}
                            onMouseOver={e => (e.currentTarget.style.borderColor = '#864DB3')}
                            onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                        >
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✏️</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{t('modal_custom_app')}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{t('modal_custom_desc')}</div>
                            </div>
                        </div>

                        {/* App grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                            {filteredApps.map(app => (
                                <div
                                    key={app.domain + app.name}
                                    onClick={() => handlePickApp(app)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                        border: '1.5px solid var(--color-border)', borderRadius: 12, cursor: 'pointer',
                                        background: 'var(--color-bg)', transition: 'all 0.15s'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.background = 'var(--color-purple-bg)'; }}
                                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg)'; }}
                                >
                                    <AppLogo domain={app.domain} name={app.name} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>{app.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{app.category}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── STEP 2: Form ── */}
                {step === 'form' && (
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && <div style={{ background: 'var(--color-red-bg)', color: 'var(--color-red)', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>{error}</div>}

                            {/* Show selected app logo if we have a domain */}
                            {form.domain && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '10px 14px', background: 'var(--color-purple-bg)', borderRadius: 10 }}>
                                    <AppLogo domain={form.domain} name={form.name} />
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{form.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{form.vendor}</div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div className="form-group" style={{ gridColumn: form.domain ? '1' : '1/-1' }}>
                                    <label className="form-label">{t('modal_name')}</label>
                                    <input className="form-input" placeholder={t('modal_name_ph')} value={form.name} onChange={e => set('name', e.target.value)} required />
                                </div>

                                {!form.domain && (
                                    <div className="form-group">
                                        <label className="form-label">{t('modal_vendor')}</label>
                                        <input className="form-input" value={form.vendor} onChange={e => set('vendor', e.target.value)} />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">{t('modal_category')}</label>
                                    <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                                        {SUBSCRIPTION_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8 }}>
                                    <div>
                                        <label className="form-label">{t('modal_cost')}</label>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <select className="form-select" style={{ padding: '8px 4px', minWidth: 72 }} value={form.currency} onChange={e => set('currency', e.target.value)}>
                                                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">&nbsp;</label>
                                        <input className="form-input" type="number" step="0.01" min="0" placeholder="0.00" value={form.cost} onChange={e => set('cost', e.target.value)} required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('modal_billing_cycle')}</label>
                                    <select className="form-select" value={form.billing_cycle} onChange={e => set('billing_cycle', e.target.value)}>
                                        {BILLING_CYCLES.map(c => <option key={c} value={c}>{t(`common_${c.replace('-', '')}` as any) || c}</option>)}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('modal_start_date')}</label>
                                    <input className="form-input" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('modal_renewal_date')}</label>
                                    <input className="form-input" type="date" value={form.renewal_date} onChange={e => set('renewal_date', e.target.value)} required />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('modal_seats')}</label>
                                    <input className="form-input" type="number" min="0" value={form.seats} onChange={e => set('seats', e.target.value)} />
                                    <span className="form-hint">{t('modal_seats_hint')}</span>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('modal_owner')}</label>
                                    <select className="form-select" value={form.owner_id} onChange={e => set('owner_id', e.target.value)}>
                                        <option value="">{t('modal_unassigned')}</option>
                                        {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name || m.email}</option>)}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t('modal_status')}</label>
                                    <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                                        <option value="active">{t('subs_status_active')}</option>
                                        <option value="trial">{t('subs_status_trial')}</option>
                                        <option value="expiring">{t('subs_status_expiring')}</option>
                                        <option value="cancelled">{t('subs_status_cancelled')}</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label">{t('modal_notes')}</label>
                                    <textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>{t('modal_cancel')}</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? t('modal_saving') : t('modal_save')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
