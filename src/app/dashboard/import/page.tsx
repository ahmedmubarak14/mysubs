'use client';

import { useState } from 'react';
import { Keyboard, UploadCloud, Landmark, ChevronLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import { useNotifications } from '@/components/NotificationsContext';

export default function ImportSubscriptionsPage() {
    const { openPanel } = useNotifications();
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<'manual' | 'upload' | 'bank' | null>(null);

    return (
        <div>
            <Topbar title="Onboarding" onToggleNotifications={openPanel}>
                <button className="btn btn-secondary btn-sm" onClick={() => router.push('/dashboard')}>Save & Exit</button>
            </Topbar>

            <div className="page-content" style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--space-8)' }}>
                <div className="card" style={{ maxWidth: 800, width: '100%', padding: 'var(--space-8)' }}>

                    {/* Header */}
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step 2 of 3</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>66% Completed</div>
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Add Your Subscriptions</h1>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: 6, background: 'var(--color-bg-tertiary)', borderRadius: 3, overflow: 'hidden', marginBottom: 24 }}>
                            <div style={{ width: '66%', height: '100%', background: 'linear-gradient(90deg, var(--color-accent), var(--color-purple))', borderRadius: 3 }} />
                        </div>

                        <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.5, maxWidth: 500 }}>
                            Choose how you want to import your team's subscription data into Subtrack. You can always add more sources later.
                        </p>
                    </div>

                    {/* Import Options Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>

                        {/* Manual */}
                        <div
                            onClick={() => setSelectedMethod('manual')}
                            style={{
                                border: selectedMethod === 'manual' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                                cursor: 'pointer', transition: 'all 0.2s',
                                background: selectedMethod === 'manual' ? 'var(--color-purple-bg)' : 'var(--color-bg)',
                                boxShadow: selectedMethod === 'manual' ? '0 0 0 4px rgba(134,77,179,0.1)' : 'var(--shadow-sm)'
                            }}
                        >
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: selectedMethod === 'manual' ? 'var(--color-accent)' : 'var(--color-bg-secondary)', color: selectedMethod === 'manual' ? '#fff' : 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, transition: 'all 0.2s' }}>
                                <Keyboard size={24} />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Manual Entry</h3>
                            <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', lineHeight: 1.4, flex: 1 }}>
                                Enter subscription details one by one. Best for small teams or specific tools.
                            </p>
                            <button className={`btn ${selectedMethod === 'manual' ? 'btn-primary' : 'btn-secondary'} btn-sm`} style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}>
                                Start Typing
                            </button>
                        </div>

                        {/* Upload Spreadsheet */}
                        <div
                            onClick={() => setSelectedMethod('upload')}
                            style={{
                                position: 'relative',
                                border: selectedMethod === 'upload' ? '2px solid var(--color-accent)' : '2px dashed var(--color-accent)',
                                borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                                cursor: 'pointer', transition: 'all 0.2s',
                                background: selectedMethod === 'upload' ? 'var(--color-purple-bg)' : 'var(--color-accent-light)',
                                boxShadow: selectedMethod === 'upload' ? '0 0 0 4px rgba(134,77,179,0.1)' : 'none'
                            }}
                        >
                            <div style={{ position: 'absolute', top: -12, background: 'var(--color-accent)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended</div>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: selectedMethod === 'upload' ? 'var(--color-accent)' : 'var(--color-bg)', color: selectedMethod === 'upload' ? '#fff' : 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}>
                                <UploadCloud size={24} />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Upload Spreadsheet</h3>
                            <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', lineHeight: 1.4, flex: 1 }}>
                                Drag & drop your CSV or Excel file here to bulk import subscriptions instantly.
                            </p>
                            <div style={{ marginTop: 24, width: '100%', background: 'var(--color-bg)', border: '1px dashed var(--color-border)', padding: '12px', borderRadius: 8, fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                                Drop file here
                            </div>
                        </div>

                        {/* Sync Bank */}
                        <div
                            onClick={() => setSelectedMethod('bank')}
                            style={{
                                border: selectedMethod === 'bank' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                                cursor: 'pointer', transition: 'all 0.2s',
                                background: selectedMethod === 'bank' ? 'var(--color-purple-bg)' : 'var(--color-bg)',
                                boxShadow: selectedMethod === 'bank' ? '0 0 0 4px rgba(134,77,179,0.1)' : 'var(--shadow-sm)'
                            }}
                        >
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: selectedMethod === 'bank' ? 'var(--color-accent)' : 'var(--color-bg-secondary)', color: selectedMethod === 'bank' ? '#fff' : 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, transition: 'all 0.2s' }}>
                                <Landmark size={24} />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Sync Bank</h3>
                            <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', lineHeight: 1.4, flex: 1 }}>
                                Connect your corporate card or bank account to auto-detect recurring charges.
                            </p>
                            <button className={`btn ${selectedMethod === 'bank' ? 'btn-primary' : 'btn-secondary'} btn-sm`} style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}>
                                Connect Account
                            </button>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
                        <button className="btn btn-ghost" onClick={() => router.back()}>
                            <ChevronLeft size={16} /> Back
                        </button>
                        <button
                            className="btn btn-primary"
                            disabled={!selectedMethod}
                            onClick={() => {
                                if (selectedMethod === 'manual') router.push('/dashboard/subscriptions');
                                else alert('Feature in development!');
                            }}
                            style={{ opacity: selectedMethod ? 1 : 0.5 }}
                        >
                            Continue
                        </button>
                    </div>

                </div>

                {/* Optional Help Text Below Card */}
                <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 13, color: 'var(--color-text-tertiary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    Need a template? <a href="#" style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: 4 }}><Download size={12} /> Download our CSV sample</a>
                </div>
            </div>

            <style jsx>{`
                .card {
                    background: var(--color-bg-secondary);
                    backdrop-filter: var(--glass-blur);
                    -webkit-backdrop-filter: var(--glass-blur);
                    border: 1px solid var(--color-border-glass);
                    box-shadow: var(--shadow-xl), inset 0 1px 0 var(--color-border-glass);
                }
            `}</style>
        </div>
    );
}
