'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Users } from 'lucide-react';
import Link from 'next/link';
import { CURRENCIES } from '@/types';
import Topbar from '@/components/Topbar';
import { useNotifications } from '@/components/NotificationsContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { APP_CATALOG, getLogoUrl } from '@/lib/appCatalog';

interface Sub {
    id: string;
    name: string;
    cost: number;
    currency: string;
    billing_cycle: string;
    renewal_date: string;
    status: string;
    seats: number;
    logo_url?: string;
}

const STATUS_COLORS: Record<string, string> = {
    active: 'var(--color-green)', expiring: 'var(--color-orange)',
    trial: 'var(--color-blue)', cancelled: 'var(--color-red)',
};

function formatCurrency(amount: number, currency = 'USD') {
    const sym = CURRENCIES.find(c => c.code === currency)?.symbol ?? '$';
    return `${sym}${amount.toFixed(0)}`;
}

export default function CalendarClient({ subscriptions }: { subscriptions: Sub[] }) {
    const { t, lang } = useLanguage();
    const { openPanel } = useNotifications();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selected, setSelected] = useState<Sub | null>(null);

    const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

    const days = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const startPadding = getDay(startOfMonth(currentDate)); // 0=Sun

    const subsOnDay = useMemo(() => {
        const map: Record<string, Sub[]> = {};
        subscriptions.forEach(sub => {
            const key = sub.renewal_date?.split('T')[0];
            if (key) {
                if (!map[key]) map[key] = [];
                map[key].push(sub);
            }
        });
        return map;
    }, [subscriptions]);

    const DAY_KEYS = [
        'cal_day_sun', 'cal_day_mon', 'cal_day_tue', 'cal_day_wed',
        'cal_day_thu', 'cal_day_fri', 'cal_day_sat'
    ];

    return (
        <div>
            <Topbar title={t('cal_title')} onToggleNotifications={openPanel}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <button className="btn btn-secondary" onClick={prevMonth} style={{ padding: '6px 12px' }}>{lang === 'ar' ? '→' : '←'}</button>
                    <span style={{ fontSize: '15px', fontWeight: 700, minWidth: 140, textAlign: 'center' }}>
                        {format(currentDate, 'MMMM yyyy', { locale: lang === 'ar' ? ar : undefined })}
                    </span>
                    <button className="btn btn-secondary" onClick={nextMonth} style={{ padding: '6px 12px' }}>{lang === 'ar' ? '←' : '→'}</button>
                </div>
            </Topbar>

            <div className="page-content" style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start', position: 'relative' }}>
                {/* Legend */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                    {Object.entries(STATUS_COLORS).map(([status, color]) => (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                            {t(`cal_status_${status}` as any) || status}
                        </div>
                    ))}
                </div>

                {/* Calendar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card" style={{ padding: 'var(--space-4)' }}>
                        {/* Day headers */}
                        <div className="calendar-grid" style={{ marginBottom: 'var(--space-2)', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                            {DAY_KEYS.map(key => (
                                <div key={key} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                                    {t(key)}
                                </div>
                            ))}
                        </div>
                        {/* Day cells */}
                        <div className="calendar-grid">
                            {/* Padding */}
                            {Array.from({ length: startPadding }).map((_, i) => (
                                <div key={`pad-${i}`} className="calendar-day other-month" />
                            ))}
                            {/* Days */}
                            {days.map(day => {
                                const key = format(day, 'yyyy-MM-dd');
                                const daysSubs = subsOnDay[key] ?? [];
                                return (
                                    <div key={key} className={`calendar-day ${isToday(day) ? 'today' : ''}`}>
                                        <div className="calendar-day-number">{format(day, 'd')}</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))', gap: '4px', padding: '0 4px', paddingBottom: '4px' }}>
                                            {daysSubs.slice(0, 8).map(sub => {
                                                const catalogEntry = APP_CATALOG.find(c => c.name.toLowerCase() === sub.name.toLowerCase());
                                                const fallbackDomain = catalogEntry ? catalogEntry.domain : `${sub.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
                                                const computedLogoUrl = sub.logo_url || getLogoUrl(fallbackDomain);

                                                return (
                                                    <div key={sub.id}
                                                        className="calendar-event"
                                                        style={{
                                                            background: `rgba(255, 255, 255, 0.75)`,
                                                            backdropFilter: 'blur(16px) saturate(200%)', WebkitBackdropFilter: 'blur(16px) saturate(200%)',
                                                            border: `1px solid rgba(255, 255, 255, 0.8)`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            borderRadius: '6px',
                                                            width: '28px', height: '28px',
                                                            boxShadow: `0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1), inset 0 0 0 1.5px ${STATUS_COLORS[sub.status]}33`,
                                                            cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.25, 1.0, 0.5, 1.0)',
                                                            position: 'relative', zIndex: 10,
                                                            ...(selected?.id === sub.id ? { borderColor: STATUS_COLORS[sub.status], boxShadow: `0 4px 16px ${STATUS_COLORS[sub.status]}33, inset 0 1px 0 rgba(255,255,255,1), inset 0 0 0 1.5px ${STATUS_COLORS[sub.status]}` } : {})
                                                        }}
                                                        onClick={() => setSelected(selected?.id === sub.id ? null : sub)}
                                                        title={`${sub.name} — ${formatCurrency(sub.cost, sub.currency)}`}
                                                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                                    >
                                                        <img src={computedLogoUrl} alt={sub.name} style={{ width: 18, height: 18, borderRadius: 3, objectFit: 'contain' }}
                                                            onError={(e) => {
                                                                const target = e.currentTarget;
                                                                const parent = target.parentElement;
                                                                if (parent) {
                                                                    parent.innerHTML = `<div style="width: 18px; height: 18px; border-radius: 3px; background: ${STATUS_COLORS[sub.status]}; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #fff; font-weight: 800">${sub.name?.[0] || '?'}</div>`;
                                                                }
                                                            }} />
                                                    </div>
                                                )
                                            })}
                                            {daysSubs.length > 8 && (
                                                <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                    +{daysSubs.length - 8}
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar detail */}
                    {selected && (
                        <div className="card" style={{
                            position: 'absolute',
                            top: 0,
                            [lang === 'ar' ? 'left' : 'right']: 0,
                            width: 320,
                            height: '100%',
                            zIndex: 20,
                            boxShadow: lang === 'ar' ? '4px 0 24px rgba(0,0,0,0.05)' : '-4px 0 24px rgba(0,0,0,0.05)',
                            direction: lang === 'ar' ? 'rtl' : 'ltr'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                                {lang === 'ar' ? (
                                    <>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
                                        <h3 style={{ fontSize: '18px', textAlign: 'left' }}>{selected.name}</h3>
                                    </>
                                ) : (
                                    <>
                                        <h3 style={{ fontSize: '18px' }}>{selected.name}</h3>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
                                    </>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{t('modal_status')}</div>
                                    <span className={`badge badge-${selected.status === 'active' ? 'green' : selected.status === 'trial' ? 'blue' : selected.status === 'expiring' ? 'orange' : 'red'}`} style={{ textTransform: 'capitalize' }}>{t(`cal_status_${selected.status}` as any) || selected.status}</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{t('modal_cost')}</div>
                                    <div style={{ fontWeight: 700, fontSize: '18px' }}>{formatCurrency(selected.cost, selected.currency)}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{t('dash_col_billing')}: {selected.billing_cycle}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{t('dash_col_renewal')}</div>
                                    <div style={{ fontWeight: 600 }}>{format(parseISO(selected.renewal_date), 'MMMM d, yyyy', { locale: lang === 'ar' ? ar : undefined })}</div>
                                </div>
                                {selected.seats > 0 && (
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{t('team_seats')}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><Users size={14} /> {selected.seats} {t('common_users')}</div>
                                    </div>
                                )}
                                <Link href={`/dashboard/subscriptions/detail?id=${selected.id}`} className="btn btn-secondary" style={{ justifyContent: 'center', marginTop: 4 }}>
                                    {t('cal_view_details') || 'View Details'}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
