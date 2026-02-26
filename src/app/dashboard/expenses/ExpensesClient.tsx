'use client';

import { useState, useMemo } from 'react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { Search, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';
import { CURRENCIES, EXPENSE_CATEGORIES } from '@/types';

interface Expense {
    id: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    expense_date: string;
    department?: string;
    project?: string;
    notes?: string;
    submitter?: { full_name: string };
}

interface Props {
    expenses: Expense[];
    orgId: string | null;
    profile: Profile | null;
}

function formatCurrency(amount: number, currency = 'USD') {
    const sym = CURRENCIES.find(c => c.code === currency)?.symbol ?? '$';
    return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function ExpensesClient({ expenses: initialExpenses, orgId, profile }: Props) {
    const supabase = createClient();
    const [expenses, setExpenses] = useState(initialExpenses);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [showAdd, setShowAdd] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '', amount: '', currency: 'USD', category: 'Software',
        expense_date: new Date().toISOString().split('T')[0],
        department: '', project: '', notes: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const filtered = useMemo(() => {
        let data = [...expenses];
        if (search) data = data.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.category?.toLowerCase().includes(search.toLowerCase()));
        if (catFilter !== 'all') data = data.filter(e => e.category === catFilter);
        return data;
    }, [expenses, search, catFilter]);

    const totalThisMonth = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now).toISOString().split('T')[0];
        const end = endOfMonth(now).toISOString().split('T')[0];
        return expenses.filter(e => e.expense_date >= start && e.expense_date <= end)
            .reduce((sum, e) => sum + e.amount, 0);
    }, [expenses]);

    const handleDelete = async (id: string) => {
        setDeleting(id);
        await supabase.from('expenses').delete().eq('id', id);
        setExpenses(prev => prev.filter(e => e.id !== id));
        setDeleting(null);
        setConfirmDelete(null);
    };

    const handleAddExpense = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!orgId) return;
        setSubmitting(true);
        const { data, error } = await supabase.from('expenses').insert({
            org_id: orgId,
            title: form.title,
            amount: parseFloat(form.amount),
            currency: form.currency,
            category: form.category,
            expense_date: form.expense_date,
            department: form.department || null,
            project: form.project || null,
            notes: form.notes || null,
            submitted_by: profile?.id,
        }).select('*, submitter:profiles(full_name)').single();

        if (!error && data) {
            setExpenses(prev => [data as Expense, ...prev]);
            setForm({ title: '', amount: '', currency: 'USD', category: 'Software', expense_date: new Date().toISOString().split('T')[0], department: '', project: '', notes: '' });
            setShowAdd(false);
        }
        setSubmitting(false);
    };

    const categories = ['all', ...Array.from(new Set(expenses.map(e => e.category).filter(Boolean)))];

    return (
        <div>
            <div className="topbar">
                <span className="topbar-title">Expenses</span>
                <div className="topbar-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
                        <Plus size={14} /> Add Expense
                    </button>
                </div>
            </div>

            <div className="page-content">
                {/* Summary strip */}
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                    {[
                        { label: 'This Month', value: formatCurrency(totalThisMonth), color: 'var(--color-purple)' },
                        { label: 'Total Expenses', value: expenses.length, color: 'var(--color-blue)' },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: 'var(--color-bg-secondary)', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '10px 18px', display: 'flex', flexDirection: 'column', minWidth: 120 }}>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color }}>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="search-input-wrapper">
                        <Search size={15} />
                        <input className="form-input" placeholder="Search expenses…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="form-select" style={{ width: 'auto' }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                        {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Expense</th>
                                <th>Category</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Added by</th>
                                <th>Amount</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon"><Plus size={28} /></div>
                                        <h3>No expenses yet</h3>
                                        <p>Log your first expense to start tracking.</p>
                                        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Expense</button>
                                    </div>
                                </td></tr>
                            ) : filtered.map(exp => (
                                <tr key={exp.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="icon-wrap-sm" style={{ background: 'var(--color-blue-bg)', color: 'var(--color-blue)', fontWeight: 800 }}>{exp.title[0]?.toUpperCase()}</div>
                                            <span style={{ fontWeight: 600, fontSize: '14px' }}>{exp.title}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-purple">{exp.category}</span></td>
                                    <td><span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{exp.department || '—'}</span></td>
                                    <td><span style={{ fontSize: '13px', fontWeight: 600 }}>{format(parseISO(exp.expense_date), 'MMM d, yyyy')}</span></td>
                                    <td><span style={{ fontSize: '13px' }}>{exp.submitter?.full_name ?? '—'}</span></td>
                                    <td><span style={{ fontWeight: 700 }}>{formatCurrency(exp.amount, exp.currency)}</span></td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-red)' }}
                                            onClick={() => handleDelete(exp.id)} disabled={deleting === exp.id}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showAdd && (
                <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Add Expense</h2>
                            <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddExpense}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Title *</label>
                                    <input className="form-input" placeholder="e.g. AWS Invoice March" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 8 }}>
                                    <div className="form-group">
                                        <label className="form-label">Currency</label>
                                        <select className="form-select" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                                            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Amount *</label>
                                        <input className="form-input" type="number" placeholder="0.00" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                            {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Date *</label>
                                        <input className="form-input" type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} required />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <input className="form-input" placeholder="e.g. Engineering" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Project</label>
                                        <input className="form-input" placeholder="e.g. Q1 Campaign" value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <textarea className="form-textarea" rows={2} placeholder="Any additional context…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Add Expense'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
