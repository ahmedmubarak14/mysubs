'use client';

import { useState, useMemo, useEffect } from 'react';
import { X, Search, ChevronLeft, Users, DollarSign, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { SUBSCRIPTION_CATEGORIES, CURRENCIES } from '@/types';
import { APP_CATALOG, getLogoUrl, AppEntry } from '@/lib/appCatalog';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Subscription, Profile } from '@/types';
import { addMonths, addYears, addDays, format } from 'date-fns';
import DatePicker from '@/components/DatePicker';

interface Props {
    onClose: () => void;
    subscription?: Subscription;
    teamMembers: Profile[];
    orgId: string;
}

const BILLING_CYCLES = ['monthly', 'yearly', 'quarterly', 'one-time'] as const;

/** Auto-calculate renewal date from start date + billing cycle */
function calcRenewalDate(startDate: string, billingCycle: string): string {
    if (!startDate) return '';
    const d = new Date(startDate);
    if (isNaN(d.getTime())) return '';
    let next: Date;
    switch (billingCycle) {
        case 'monthly': next = addMonths(d, 1); break;
        case 'yearly': next = addYears(d, 1); break;
        case 'quarterly': next = addMonths(d, 3); break;
        case 'one-time': next = addDays(d, 1); break;
        default: next = addMonths(d, 1);
    }
    return format(next, 'yyyy-MM-dd');
}

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
    const [renewalEdited, setRenewalEdited] = useState(isEdit); // true = user has manually set renewal

    const [form, setForm] = useState({
        name: subscription?.name ?? '',
        vendor: subscription?.vendor ?? '',
        domain: '',
        category: subscription?.category ?? 'Other',
        // Pricing
        pricePerUser: '',                           // new: price per seat
        cost: subscription?.cost?.toString() ?? '', // total cost
        pricingMode: 'total' as 'total' | 'per_user',
        currency: subscription?.currency ?? 'USD',
        billing_cycle: subscription?.billing_cycle ?? 'monthly',
        // Dates
        start_date: subscription?.start_date ?? format(new Date(), 'yyyy-MM-dd'),
        renewal_date: subscription?.renewal_date ?? '',
        seats: subscription?.seats?.toString() ?? '1',
        owner_id: subscription?.owner_id ?? '',
        status: subscription?.status ?? 'active',
        notes: subscription?.notes ?? '',
    });

    const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

    // Auto-calc renewal date when start_date or billing_cycle changes (unless user manually edited renewal)
    useEffect(() => {
        if (!renewalEdited && form.start_date) {
            const auto = calcRenewalDate(form.start_date, form.billing_cycle);
            if (auto) setForm(f => ({ ...f, renewal_date: auto }));
        }
    }, [form.start_date, form.billing_cycle, renewalEdited]);

    // Auto-calc total cost when pricePerUser × seats (in per_user mode)
    const computedTotal = useMemo(() => {
        if (form.pricingMode !== 'per_user') return null;
        const ppu = parseFloat(form.pricePerUser);
        const seats = parseInt(form.seats) || 1;
        if (isNaN(ppu) || ppu <= 0) return null;
        return ppu * seats;
    }, [form.pricingMode, form.pricePerUser, form.seats]);

    useEffect(() => {
        if (computedTotal !== null) {
            setForm(f => ({ ...f, cost: computedTotal.toFixed(2) }));
        }
    }, [computedTotal]);

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

    const currSym = CURRENCIES.find(c => c.code === form.currency)?.symbol ?? '$';

    return (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal" style={{ maxWidth: step === 'pick' ? 700 : 580 }}>
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

                        <div
                            onClick={() => handlePickApp(null)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                                border: '2px dashed var(--color-accent)', borderRadius: 12, cursor: 'pointer',
                                marginBottom: 16, background: 'var(--color-purple-bg)', transition: 'all 0.15s'
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
                                {/* Name */}
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

                                {/* Category */}
                                <div className="form-group">
                                    <label className="form-label">{t('modal_category')}</label>
                                    <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                                        {SUBSCRIPTION_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>

                                {/* Billing Cycle */}
                                <div className="form-group">
                                    <label className="form-label">{t('modal_billing_cycle')}</label>
                                    <select className="form-select" value={form.billing_cycle} onChange={e => set('billing_cycle', e.target.value)}>
                                        {BILLING_CYCLES.map(c => <option key={c} value={c}>{t(`common_${c.replace('-', '')}` as any) || c}</option>)}
                                    </select>
                                </div>

                                {/* ── Seats & Pricing ── */}
                                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} /> Seats & Pricing</span>
                                        {/* Toggle: total vs per-user */}
                                        <div style={{ display: 'flex', background: 'var(--color-bg-secondary)', borderRadius: 8, padding: 3, gap: 2, fontSize: 11 }}>
                                            {(['total', 'per_user'] as const).map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => set('pricingMode', m)}
                                                    style={{
                                                        padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 11,
                                                        background: form.pricingMode === m ? 'var(--color-accent)' : 'transparent',
                                                        color: form.pricingMode === m ? '#fff' : 'var(--color-text-secondary)',
                                                        transition: 'all 0.15s'
                                                    }}
                                                >
                                                    {m === 'total' ? 'Total Price' : 'Per User'}
                                                </button>
                                            ))}
                                        </div>
                                    </label>

                                    <div style={{ display: 'grid', gridTemplateColumns: form.pricingMode === 'per_user' ? '80px 1fr 1fr' : '80px 1fr', gap: 8 }}>
                                        {/* Currency + Seats */}
                                        <select className="form-select" style={{ padding: '8px 4px' }} value={form.currency} onChange={e => set('currency', e.target.value)}>
                                            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                        </select>

                                        {form.pricingMode === 'per_user' ? (
                                            <>
                                                {/* Price per user */}
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', fontSize: 13, fontWeight: 600 }}>{currSym}</span>
                                                    <input
                                                        className="form-input"
                                                        type="number" step="0.01" min="0"
                                                        placeholder="Price / user"
                                                        value={form.pricePerUser}
                                                        onChange={e => set('pricePerUser', e.target.value)}
                                                        style={{ paddingLeft: 26 }}
                                                    />
                                                </div>
                                                {/* Seats */}
                                                <div style={{ position: 'relative' }}>
                                                    <Users size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                                                    <input
                                                        className="form-input"
                                                        type="number" min="1"
                                                        placeholder="Seats"
                                                        value={form.seats}
                                                        onChange={e => set('seats', e.target.value)}
                                                        style={{ paddingLeft: 30 }}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <input
                                                className="form-input"
                                                type="number" step="0.01" min="0"
                                                placeholder="0.00"
                                                value={form.cost}
                                                onChange={e => set('cost', e.target.value)}
                                                required
                                            />
                                        )}
                                    </div>

                                    {/* Computed total summary */}
                                    {form.pricingMode === 'per_user' && (
                                        <div style={{
                                            marginTop: 8, display: 'flex', alignItems: 'center', gap: 8,
                                            background: computedTotal !== null ? 'var(--color-green-bg)' : 'var(--color-bg-secondary)',
                                            borderRadius: 8, padding: '8px 12px', fontSize: 13
                                        }}>
                                            <DollarSign size={14} color={computedTotal !== null ? 'var(--color-green)' : 'var(--color-text-tertiary)'} />
                                            {computedTotal !== null ? (
                                                <span>
                                                    <strong>{currSym}{computedTotal.toFixed(2)}</strong> total
                                                    &nbsp;({currSym}{parseFloat(form.pricePerUser || '0').toFixed(2)} × {form.seats || 1} users/{form.billing_cycle})
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--color-text-tertiary)' }}>Enter price per user to auto-calculate total</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Seats input in total mode */}
                                    {form.pricingMode === 'total' && (
                                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Users size={13} color="var(--color-text-tertiary)" />
                                            <input
                                                className="form-input"
                                                type="number" min="0"
                                                placeholder="Number of seats (optional)"
                                                value={form.seats}
                                                onChange={e => set('seats', e.target.value)}
                                                style={{ maxWidth: 200 }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* ── Dates ── */}
                                <DatePicker
                                    value={form.start_date}
                                    onChange={v => { set('start_date', v); setRenewalEdited(false); }}
                                    label="Start Date"
                                    placeholder="Select start date"
                                />

                                <DatePicker
                                    value={form.renewal_date}
                                    onChange={v => { set('renewal_date', v); if (v !== calcRenewalDate(form.start_date, form.billing_cycle)) setRenewalEdited(true); }}
                                    label="Renewal Date"
                                    placeholder="Select renewal date"
                                    badge={
                                        !renewalEdited && form.start_date ? (
                                            <span style={{ fontSize: 10, background: 'var(--color-green-bg)', color: 'var(--color-green)', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>
                                                Auto-calculated
                                            </span>
                                        ) : undefined
                                    }
                                    hint={
                                        !renewalEdited && form.start_date ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                                                <Info size={11} /> Based on start date + {form.billing_cycle} cycle. Edit to override.
                                            </span>
                                        ) : undefined
                                    }
                                />

                                {/* Owner */}
                                <div className="form-group">
                                    <label className="form-label">{t('modal_owner')}</label>
                                    <select className="form-select" value={form.owner_id} onChange={e => set('owner_id', e.target.value)}>
                                        <option value="">{t('modal_unassigned')}</option>
                                        {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name || m.email}</option>)}
                                    </select>
                                </div>

                                {/* Status */}
                                <div className="form-group">
                                    <label className="form-label">{t('modal_status')}</label>
                                    <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                                        <option value="active">{t('subs_status_active')}</option>
                                        <option value="trial">{t('subs_status_trial')}</option>
                                        <option value="expiring">{t('subs_status_expiring')}</option>
                                        <option value="cancelled">{t('subs_status_cancelled')}</option>
                                    </select>
                                </div>

                                {/* Notes */}
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
