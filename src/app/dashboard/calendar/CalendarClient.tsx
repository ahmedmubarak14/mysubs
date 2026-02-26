'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';
import { CURRENCIES } from '@/types';

interface Sub {
    id: string;
    name: string;
    cost: number;
    currency: string;
    billing_cycle: string;
    renewal_date: string;
    status: string;
    seats: number;
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

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div>
            <div className="topbar">
                <span className="topbar-title">Renewal Calendar</span>
                <div className="topbar-actions">
                    <button className="btn btn-secondary btn-sm" onClick={prevMonth}><ChevronLeft size={14} /></button>
                    <span style={{ fontSize: '14px', fontWeight: 700, minWidth: 130, textAlign: 'center' }}>
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button className="btn btn-secondary btn-sm" onClick={nextMonth}><ChevronRight size={14} /></button>
                </div>
            </div>

            <div className="page-content">
                {/* Legend */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                    {Object.entries(STATUS_COLORS).map(([status, color]) => (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                            {status}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
                    {/* Calendar */}
                    <div className="card" style={{ padding: 'var(--space-4)' }}>
                        {/* Day headers */}
                        <div className="calendar-grid" style={{ marginBottom: 2 }}>
                            {DAYS.map(d => (
                                <div key={d} className="calendar-day-header">{d}</div>
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
                                        {daysSubs.slice(0, 3).map(sub => (
                                            <div key={sub.id}
                                                className="calendar-event"
                                                style={{ background: `${STATUS_COLORS[sub.status]}22`, color: STATUS_COLORS[sub.status] }}
                                                onClick={() => setSelected(selected?.id === sub.id ? null : sub)}
                                                title={`${sub.name} — ${formatCurrency(sub.cost, sub.currency)}`}
                                            >
                                                {sub.name}
                                            </div>
                                        ))}
                                        {daysSubs.length > 3 && (
                                            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: 2, paddingLeft: 4 }}>
                                                +{daysSubs.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sidebar detail */}
                    {selected && (
                        <div className="card" style={{ position: 'sticky', top: 80 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                                <h3 style={{ fontSize: '16px' }}>{selected.name}</h3>
                                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Status</div>
                                    <span className={`badge badge-${selected.status === 'active' ? 'green' : selected.status === 'trial' ? 'blue' : selected.status === 'expiring' ? 'orange' : 'red'}`} style={{ textTransform: 'capitalize' }}>{selected.status}</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Cost</div>
                                    <div style={{ fontWeight: 700, fontSize: '18px' }}>{formatCurrency(selected.cost, selected.currency)}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>per {selected.billing_cycle}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Renewal Date</div>
                                    <div style={{ fontWeight: 600 }}>{format(parseISO(selected.renewal_date), 'MMMM d, yyyy')}</div>
                                </div>
                                {selected.seats > 0 && (
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Users</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}><Users size={14} /> {selected.seats} users</div>
                                    </div>
                                )}
                                <Link href={`/dashboard/subscriptions/detail?id=${selected.id}`} className="btn btn-secondary" style={{ justifyContent: 'center', marginTop: 4 }}>
                                    View Details
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
