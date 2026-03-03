'use client';

import { format, parseISO } from 'date-fns';
import { DollarSign, Clock } from 'lucide-react';
import { CURRENCIES } from '@/types';
import type { SubscriptionPayment } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Props {
    payments: SubscriptionPayment[];
}

function fmt(amount: number, currency: string) {
    const sym = CURRENCIES.find(c => c.code === currency)?.symbol ?? '$';
    return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PaymentHistory({ payments }: Props) {
    const { t } = useLanguage();

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const currency = payments[0]?.currency ?? 'USD';

    return (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="icon-wrap" style={{ background: 'var(--color-green-bg)' }}>
                        <DollarSign size={20} color="var(--color-green)" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700 }}>{t('sub_payments_title')}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                            {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
                        </div>
                    </div>
                </div>
                {payments.length > 0 && (
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Total Paid</div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-green)' }}>{fmt(totalPaid, currency)}</div>
                    </div>
                )}
            </div>

            {payments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
                    <Clock size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <div>{t('sub_payments_empty')}</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Payments are auto-logged when you confirm renewals</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {payments.map((payment, i) => (
                        <div
                            key={payment.id}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 0',
                                borderBottom: i < payments.length - 1 ? '1px solid var(--color-border)' : 'none',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: 'var(--color-green-bg)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <DollarSign size={16} color="var(--color-green)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{fmt(payment.amount, payment.currency)}</div>
                                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                                        {t('sub_payments_paid_on')} {format(parseISO(payment.paid_at), 'MMM d, yyyy')}
                                    </div>
                                    {payment.notes && (
                                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{payment.notes}</div>
                                    )}
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                                {payment.currency}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
