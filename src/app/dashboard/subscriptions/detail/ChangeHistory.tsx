'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';
import { History, ArrowRight } from 'lucide-react';
import type { SubscriptionHistoryEntry } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Props {
    history: SubscriptionHistoryEntry[];
}

function formatFieldName(field: string): string {
    const labels: Record<string, string> = {
        status: 'Status',
        cost: 'Cost',
        renewal_date: 'Next Payment Date',
        owner_id: 'Owner',
        billing_cycle: 'Billing Cycle',
        seats: 'Seats',
        tier: 'Tier',
        contract_end_date: 'Contract End Date',
        notes: 'Notes',
    };
    return labels[field] ?? field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function ChangeHistory({ history }: Props) {
    const { t } = useLanguage();

    return (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-5)' }}>
                <div className="icon-wrap" style={{ background: 'var(--color-purple-bg)' }}>
                    <History size={20} color="var(--color-purple)" />
                </div>
                <div>
                    <div style={{ fontWeight: 700 }}>{t('sub_history_title')}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                        {history.length} change{history.length !== 1 ? 's' : ''} recorded
                    </div>
                </div>
            </div>

            {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
                    <History size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <div>{t('sub_history_empty')}</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Changes to status, cost, owner, etc. are automatically tracked</div>
                </div>
            ) : (
                <div style={{ position: 'relative', paddingLeft: 20 }}>
                    {/* Vertical timeline line */}
                    <div style={{
                        position: 'absolute', left: 6, top: 8, bottom: 8,
                        width: 2, background: 'var(--color-border)', borderRadius: 2,
                    }} />

                    {history.map((entry, i) => (
                        <div
                            key={entry.id}
                            style={{
                                position: 'relative',
                                display: 'flex', flexDirection: 'column', gap: 2,
                                paddingBottom: i < history.length - 1 ? 16 : 0,
                            }}
                        >
                            {/* Dot */}
                            <div style={{
                                position: 'absolute', left: -17, top: 4,
                                width: 10, height: 10, borderRadius: '50%',
                                background: 'var(--color-accent)',
                                border: '2px solid var(--color-bg-primary)',
                                boxShadow: '0 0 0 2px var(--color-accent)',
                            }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{formatFieldName(entry.field_name)}</span>
                                <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{t('sub_history_changed')}</span>
                                {entry.old_value && (
                                    <>
                                        <span style={{
                                            fontSize: 12, padding: '1px 8px', borderRadius: 6,
                                            background: 'var(--color-red-bg)', color: 'var(--color-red)',
                                            fontWeight: 600, textDecoration: 'line-through'
                                        }}>
                                            {entry.old_value}
                                        </span>
                                        <ArrowRight size={12} color="var(--color-text-tertiary)" />
                                    </>
                                )}
                                <span style={{
                                    fontSize: 12, padding: '1px 8px', borderRadius: 6,
                                    background: 'var(--color-green-bg)', color: 'var(--color-green)',
                                    fontWeight: 600,
                                }}>
                                    {entry.new_value ?? t('sub_history_unknown')}
                                </span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                                {formatDistanceToNow(parseISO(entry.changed_at), { addSuffix: true })}
                                {entry.changer?.full_name && ` · by ${entry.changer.full_name}`}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
