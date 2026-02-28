'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard, CreditCard, DollarSign, Calendar,
    Users, Settings, Zap, LogOut, Bell
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface SidebarProps {
    profile?: Profile | null;
    onToggleNotifications?: () => void;
}

export default function Sidebar({ profile, onToggleNotifications }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { t, lang, setLang } = useLanguage();

    const navItems = [
        { href: '/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
        { href: '/dashboard/subscriptions', label: t('nav_subscriptions'), icon: CreditCard },
        { href: '/dashboard/expenses', label: t('nav_expenses'), icon: DollarSign },
        { href: '/dashboard/calendar', label: t('nav_calendar'), icon: Calendar },
        { href: '/dashboard/team', label: t('nav_team'), icon: Users },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const initials = profile?.full_name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ?? 'U';

    return (
        <nav className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <Link href="/">
                    <img src="/SubTrack/logo-light.png" alt="Subtrack" className="sidebar-logo-img" style={{ maxHeight: 36, width: 'auto', cursor: 'pointer' }} />
                </Link>
            </div>

            {/* Navigation */}
            <div className="sidebar-section">
                <div className="sidebar-section-label" style={{ marginBottom: '8px', marginTop: '8px' }}>
                    {t('nav_menu')}
                </div>
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                        <Link key={href} href={href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                            <Icon size={18} />
                            {label}
                        </Link>
                    );
                })}

                <div className="sidebar-section-label" style={{ marginBottom: '8px', marginTop: '20px' }}>
                    {t('nav_account')}
                </div>
                <Link href="/dashboard/settings" className={`sidebar-link ${pathname.startsWith('/dashboard/settings') ? 'active' : ''}`}>
                    <Settings size={18} />
                    {t('nav_settings')}
                </Link>
            </div>

            {/* Language Toggle */}
            <div style={{ padding: '0 12px 8px', marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                <LanguageSwitcher />
            </div>

            {/* User footer */}
            <div className="sidebar-footer">
                <div className="sidebar-user" onClick={handleLogout} title="Sign out">
                    <div className="sidebar-avatar">{initials}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{profile?.full_name || profile?.email?.split('@')[0] || 'User'}</div>
                        <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>{profile?.role ?? 'member'}</div>
                    </div>
                    <LogOut size={16} style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 'auto', flexShrink: 0 }} />
                </div>
            </div>
        </nav>
    );
}
