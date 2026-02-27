'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, parseISO } from 'date-fns';
import Link from 'next/link';
import { CURRENCIES, type Subscription } from '@/types';

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
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

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

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Renewal Calendar</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <button className="btn btn-secondary btn-sm" onClick={prevMonth} style={{ padding: '4px 8px' }}>←</button>
                    <span style={{ fontSize: '13px', fontWeight: 600, minWidth: 100, textAlign: 'center' }}>
                        {format(currentDate, 'MMM yyyy')}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={nextMonth} style={{ padding: '4px 8px' }}>→</button>
                </div>
            </div>

            <div className="calendar-grid" style={{ marginBottom: 2, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {DAYS.map(d => (
                    <div key={d} style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-tertiary)', textAlign: 'center', textTransform: 'uppercase', padding: '4px 0' }}>{d}</div>
                ))}
            </div>

            <div className="calendar-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, gridAutoRows: 'minmax(60px, auto)' }}>
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

                            {daysSubs.slice(0, 2).map(sub => (
                                <Link href={`/dashboard/subscriptions/detail?id=${sub.id}`} key={sub.id} style={{
                                    background: `rgba(255, 255, 255, 0.8)`,
                                    border: `1px solid ${STATUS_COLORS[sub.status]}40`,
                                    borderLeft: `2px solid ${STATUS_COLORS[sub.status]}`,
                                    padding: '2px 4px',
                                    borderRadius: '4px',
                                    fontSize: '9px',
                                    fontWeight: 600,
                                    color: 'var(--color-text-primary)',
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textDecoration: 'none'
                                }} title={`${sub.name} - ${formatCurrency(sub.cost, sub.currency)}`}>
                                    {sub.name}
                                </Link>
                            ))}
                            {daysSubs.length > 2 && (
                                <div style={{ fontSize: '8px', color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: 'auto' }}>
                                    +{daysSubs.length - 2} more
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '10px', fontWeight: 600, textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                        {status}
                    </div>
                ))}
            </div>
        </div>
    );
}
