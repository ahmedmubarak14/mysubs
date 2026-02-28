'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { CURRENCIES, type Subscription } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { APP_CATALOG, getLogoUrl } from '@/lib/appCatalog';

const STATUS_KEYS: Record<string, string> = {
    active: 'cal_status_active',
    expiring: 'cal_status_expiring',
    trial: 'cal_status_trial',
    cancelled: 'cal_status_cancelled',
};

const STATUS_COLORS: Record<string, string> = {
    active: 'var(--color-green)',
    expiring: 'var(--color-orange)',
    trial: 'var(--color-blue)',
    cancelled: 'var(--color-red)',
};

function formatCurrency(amount: number, currency = 'USD') {
    const sym = CURRENCIES.find(c => c.code === currency)?.symbol ?? '$';
    return `${sym}${amount.toFixed(0)}`;
}

interface Props {
    subscriptions: Subscription[];
}

export default function DashboardCalendar({ subscriptions }: Props) {
    const { t, lang } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

    const DAY_KEYS = [
        'cal_day_sun', 'cal_day_mon', 'cal_day_tue', 'cal_day_wed',
        'cal_day_thu', 'cal_day_fri', 'cal_day_sat'
    ] as const;

    const days = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const startPadding = getDay(startOfMonth(currentDate)); // 0=Sun

    const subsOnDay = useMemo(() => {
        const map: Record<string, Subscription[]> = {};
        subscriptions.forEach(sub => {
            const key = sub.renewal_date?.split('T')[0];
            if (key) {
                if (!map[key]) map[key] = [];
                map[key].push(sub);
            }
        });
        return map;
    }, [subscriptions]);

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('cal_title')}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <button className="btn btn-secondary btn-sm" onClick={prevMonth} style={{ padding: '4px 8px' }}>{lang === 'ar' ? '→' : '←'}</button>
                    <span style={{ fontSize: '13px', fontWeight: 600, minWidth: 100, textAlign: 'center' }}>
                        {format(currentDate, 'MMM yyyy', { locale: lang === 'ar' ? ar : undefined })}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={nextMonth} style={{ padding: '4px 8px' }}>{lang === 'ar' ? '←' : '→'}</button>
                </div>
            </div>

            <div className="calendar-grid" style={{ marginBottom: 2, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                {DAY_KEYS.map(key => (
                    <div key={key} style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-tertiary)', textAlign: 'center', textTransform: 'uppercase', padding: '4px 0' }}>
                        {t(key)}
                    </div>
                ))}
            </div>

            <div className="calendar-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, gridAutoRows: 'minmax(60px, auto)', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                {/* Padding */}
                {Array.from({ length: startPadding }).map((_, i) => (
                    <div key={`pad-${i}`} style={{ background: 'rgba(0,0,0,0.02)', borderRadius: '4px' }} />
                ))}

                {/* Days */}
                {days.map(day => {
                    const key = format(day, 'yyyy-MM-dd');
                    const daysSubs = subsOnDay[key] ?? [];
                    const isCurrentDay = isToday(day);

                    return (
                        <div key={key} style={{
                            background: isCurrentDay ? 'var(--color-bg)' : 'rgba(255,255,255,0.4)',
                            border: isCurrentDay ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                            borderRadius: '6px',
                            padding: '4px',
                            display: 'flex', flexDirection: 'column', gap: '2px'
                        }}>
                            <div style={{ fontSize: '11px', fontWeight: isCurrentDay ? 700 : 500, color: isCurrentDay ? 'var(--color-accent)' : 'var(--color-text-secondary)', marginBottom: 2 }}>{format(day, 'd')}</div>

                            {daysSubs.slice(0, 4).map(sub => {
                                const catalogEntry = APP_CATALOG.find(c => c.name.toLowerCase() === sub.name.toLowerCase());
                                const fallbackDomain = catalogEntry ? catalogEntry.domain : `${sub.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
                                const computedLogoUrl = sub.logo_url || getLogoUrl(fallbackDomain);

                                return (
                                    <Link href={`/dashboard/subscriptions/detail?id=${sub.id}`} key={sub.id}
                                        style={{
                                            background: `linear-gradient(135deg, ${STATUS_COLORS[sub.status]}15, transparent)`,
                                            border: `1px solid ${STATUS_COLORS[sub.status]}30`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: '6px', borderRadius: '8px',
                                            transition: 'all 0.2s cubic-bezier(0.25, 1.0, 0.5, 1.0)',
                                            textDecoration: 'none', position: 'relative', zIndex: 10,
                                            width: '28px', height: '28px'
                                        }}
                                        title={`${sub.name} — ${sub.cost}`}
                                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <img src={computedLogoUrl} alt={sub.name} style={{ width: 16, height: 16, borderRadius: 3, objectFit: 'contain' }}
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                const parent = target.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = `<div style="width: 16px; height: 16px; border-radius: 3px; background: ${STATUS_COLORS[sub.status]}; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #fff; font-weight: 800">${sub.name?.[0] || '?'}</div>`;
                                                }
                                            }} />
                                    </Link>
                                );
                            })}
                            {daysSubs.length > 4 && (
                                <div style={{ fontSize: '8px', color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: 'auto' }}>
                                    +{daysSubs.length - 4} {t('cal_more')}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
                {Object.entries(STATUS_KEYS).map(([status, labelKey]) => (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '10px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[status] }} />
                        {t(labelKey as any)}
                    </div>
                ))}
            </div>
        </div >
    );
}
