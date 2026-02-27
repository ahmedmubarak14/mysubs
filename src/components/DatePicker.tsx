'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, isToday,
    addMonths, subMonths, parseISO, isValid
} from 'date-fns';

interface DatePickerProps {
    value: string;          // yyyy-MM-dd
    onChange: (v: string) => void;
    placeholder?: string;
    required?: boolean;
    label?: string;
    badge?: React.ReactNode;
    hint?: React.ReactNode;
    minDate?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function DatePicker({ value, onChange, placeholder, label, badge, hint, minDate }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<Date>(() => {
        if (value) { const d = parseISO(value); return isValid(d) ? d : new Date(); }
        return new Date();
    });
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = value ? parseISO(value) : null;
    const min = minDate ? parseISO(minDate) : null;

    // Sync view month when value changes externally
    useEffect(() => {
        if (value) {
            const d = parseISO(value);
            if (isValid(d)) setView(d);
        }
    }, [value]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(view)),
        end: endOfWeek(endOfMonth(view)),
    });

    const pick = (day: Date) => {
        onChange(format(day, 'yyyy-MM-dd'));
        setOpen(false);
    };

    const isDisabled = (day: Date) => {
        if (!min) return false;
        return day < min;
    };

    const displayValue = selected && isValid(selected)
        ? format(selected, 'MMM d, yyyy')
        : '';

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            {label && (
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{label}</span>
                    {badge}
                </label>
            )}

            {/* Trigger input */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${open ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: 'var(--color-bg-secondary)', cursor: 'pointer',
                    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                    transition: 'all 0.2s', textAlign: 'left',
                    boxShadow: open ? '0 0 0 3px rgba(134,77,179,0.12), var(--shadow-sm)' : 'inset 0 1px 0 var(--color-border-glass)',
                }}
            >
                <Calendar size={15} color={open ? 'var(--color-accent)' : 'var(--color-text-tertiary)'} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, color: displayValue ? 'var(--color-text)' : 'var(--color-text-tertiary)' }}>
                    {displayValue || placeholder || 'Select date'}
                </span>
                {selected && (
                    <span
                        onClick={e => { e.stopPropagation(); onChange(''); }}
                        style={{ fontSize: 16, lineHeight: 1, color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '0 2px' }}
                        title="Clear"
                    >×</span>
                )}
            </button>

            {hint && <div style={{ marginTop: 4 }}>{hint}</div>}

            {/* Calendar popup */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 1000,
                    background: 'var(--color-bg-secondary)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    border: '1px solid var(--color-border-glass)',
                    borderRadius: 14,
                    boxShadow: 'var(--shadow-lg), 0 0 0 1px var(--color-border)',
                    padding: '14px 14px 12px',
                    minWidth: 270,
                    animation: 'fadeSlideIn 0.12s ease',
                }}>
                    {/* Month nav */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <button
                            type="button"
                            onClick={() => setView(v => subMonths(v, 1))}
                            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}
                        >
                            <ChevronLeft size={14} />
                        </button>

                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>
                            {format(view, 'MMMM yyyy')}
                        </span>

                        <button
                            type="button"
                            onClick={() => setView(v => addMonths(v, 1))}
                            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                        {DAYS.map(d => (
                            <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--color-text-tertiary)', padding: '2px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                        {days.map(day => {
                            const isSelected = selected ? isSameDay(day, selected) : false;
                            const isCurrentMonth = isSameMonth(day, view);
                            const isTodayDay = isToday(day);
                            const disabled = isDisabled(day);

                            return (
                                <button
                                    key={day.toISOString()}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => pick(day)}
                                    style={{
                                        width: '100%', aspectRatio: '1', borderRadius: 8, border: 'none',
                                        cursor: disabled ? 'not-allowed' : 'pointer',
                                        fontSize: 12, fontWeight: isSelected || isTodayDay ? 700 : 500,
                                        background: isSelected
                                            ? 'linear-gradient(135deg, #864DB3, #5B2D8E)'
                                            : isTodayDay && !isSelected
                                                ? 'var(--color-purple-bg)'
                                                : 'transparent',
                                        color: isSelected
                                            ? '#fff'
                                            : !isCurrentMonth || disabled
                                                ? 'var(--color-text-tertiary)'
                                                : isTodayDay
                                                    ? 'var(--color-accent)'
                                                    : 'var(--color-text)',
                                        boxShadow: isSelected ? '0 2px 8px rgba(134,77,179,0.4)' : 'none',
                                        outline: isTodayDay && !isSelected ? '1.5px solid var(--color-accent)' : 'none',
                                        transition: 'all 0.1s',
                                        opacity: (!isCurrentMonth || disabled) ? 0.4 : 1,
                                    }}
                                    onMouseOver={e => {
                                        if (!isSelected && !disabled) {
                                            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-purple-bg)';
                                        }
                                    }}
                                    onMouseOut={e => {
                                        if (!isSelected && !disabled) {
                                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                        }
                                    }}
                                >
                                    {format(day, 'd')}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border)' }}>
                        <button
                            type="button"
                            onClick={() => { onChange(''); setOpen(false); }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => { pick(new Date()); }}
                            style={{ background: 'var(--color-purple-bg)', border: 'none', borderRadius: 8, padding: '4px 12px', color: 'var(--color-accent)', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
