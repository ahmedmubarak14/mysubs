export type UserRole = 'admin' | 'manager' | 'viewer';
export type BillingCycle = 'monthly' | 'yearly' | 'quarterly' | 'one-time';
export type SubscriptionStatus = 'active' | 'expiring' | 'cancelled' | 'trial';

export interface Organization {
    id: string;
    name: string;
    slug: string;
    plan: string;
    created_at: string;
}

export interface Profile {
    id: string;
    org_id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    role: UserRole;
    created_at: string;
}

export interface Subscription {
    id: string;
    org_id: string;
    name: string;
    vendor: string;
    logo_url?: string;
    category: string;
    cost: number;
    currency: string;
    billing_cycle: BillingCycle;
    start_date: string;
    renewal_date: string;
    status: SubscriptionStatus;
    seats: number;
    seat_cost?: number;
    owner_id?: string;
    notes?: string;
    created_at: string;
    // Joined
    owner?: Profile;
}

export interface Expense {
    id: string;
    org_id: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    expense_date: string;
    department?: string;
    project?: string;
    submitted_by: string;
    receipt_url?: string;
    notes?: string;
    created_at: string;
    // Joined
    submitter?: Profile;
}

export interface Notification {
    id: string;
    org_id: string;
    user_id: string;
    subscription_id?: string;
    type: 'renewal_reminder' | 'expiry_alert' | 'new_member' | 'info';
    message: string;
    is_read: boolean;
    notify_at?: string;
    created_at: string;
}

export const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
];

export const SUBSCRIPTION_CATEGORIES = [
    'Design', 'Development', 'Marketing', 'Communication',
    'Analytics', 'Finance', 'HR', 'Operations', 'Security',
    'Cloud', 'AI & ML', 'Other',
];

export const EXPENSE_CATEGORIES = [
    'Software', 'Hardware', 'Travel', 'Office Supplies',
    'Marketing', 'Training', 'Utilities', 'Consulting', 'Other',
];
