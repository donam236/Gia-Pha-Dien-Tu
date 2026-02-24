'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    TreePine,
    Users,
    Image,
    Shield,
    FileText,
    Database,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    ClipboardCheck,
    Contact,
    Newspaper,
    CalendarDays,
    HelpCircle,
    Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { motion } from 'framer-motion';

const navItems = [
    { href: '/', label: 'Trang chủ', icon: Home },
    { href: '/feed', label: 'Bảng tin', icon: Newspaper },
    { href: '/directory', label: 'Danh bạ', icon: Contact },
    { href: '/events', label: 'Sự kiện', icon: CalendarDays },
    { href: '/tree', label: 'Cây gia phả', icon: TreePine },
    { href: '/book', label: 'Sách gia phả', icon: BookOpen },
    { href: '/people', label: 'Thành viên', icon: Users },
    { href: '/media', label: 'Thư viện', icon: Image },
];

const adminItems = [
    { href: '/admin/users', label: 'Quản lý Users', icon: Shield },
    { href: '/admin/edits', label: 'Kiểm duyệt', icon: ClipboardCheck },
    { href: '/admin/audit', label: 'Audit Log', icon: FileText },
    { href: '/admin/backup', label: 'Backup', icon: Database },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { isAdmin } = useAuth();

    return (
        <aside
            className={cn(
                'relative flex flex-col z-[45] transition-all duration-500 ease-in-out h-screen sticky top-0 overflow-hidden',
                'bg-white/80 dark:bg-surface-950/80 backdrop-blur-2xl border-r border-surface-200 dark:border-white/5',
                collapsed ? 'w-20' : 'w-72',
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 h-20 shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30">
                    <TreePine className="h-6 w-6 text-white" />
                </div>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        <span className="font-black text-lg tracking-tight leading-none italic text-surface-900 dark:text-white">GIA PHẢ</span>
                        <span className="text-[10px] font-bold text-primary-500 tracking-[0.2em] uppercase">LÊ HUY</span>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                <div className="mb-4">
                    {!collapsed && (
                        <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">Menu chính</p>
                    )}
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={cn(
                                        'group relative flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300',
                                        isActive
                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-white/5 hover:text-surface-900 dark:hover:text-white',
                                    )}
                                >
                                    <item.icon className={cn('h-5 w-5 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-surface-400 group-hover:text-primary-500')} />
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {isAdmin && (
                    <div className="pt-6 border-t border-surface-100 dark:border-white/5 space-y-2">
                        {!collapsed && (
                            <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">Hệ thống</p>
                        )}
                        {adminItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div
                                        className={cn(
                                            'group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300',
                                            isActive
                                                ? 'bg-surface-900 text-white dark:bg-white dark:text-surface-950'
                                                : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-white/5 hover:text-surface-900 dark:hover:text-white',
                                        )}
                                    >
                                        <item.icon className="h-5 w-5 shrink-0" />
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </nav>

            {/* Support Box */}
            {!collapsed && (
                <div className="px-6 py-6 border-t border-surface-100 dark:border-white/5">
                    <div className="p-4 rounded-[2rem] bg-surface-100/50 dark:bg-white/5 border border-surface-200 dark:border-white/10 shadow-inner">
                        <div className="flex items-center gap-2 mb-2 text-primary-500">
                            <HelpCircle className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Hỗ trợ</span>
                        </div>
                        <p className="text-[10px] text-surface-600 dark:text-surface-400 mb-3 leading-relaxed font-bold">
                            Cần hỗ trợ thiết lập gia phả riêng cho dòng họ?
                        </p>
                        <a href="tel:0889991120" className="flex items-center gap-2 text-xs font-black text-surface-900 dark:text-white hover:text-primary-500 transition-colors">
                            <Phone className="h-3 w-3" />
                            088 999 1120
                        </a>
                    </div>
                </div>
            )}

            {/* Collapse toggle */}
            <div className="p-4 h-20 shrink-0 flex items-center justify-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-12 rounded-2xl hover:bg-surface-100 dark:hover:bg-white/5 border border-transparent hover:border-surface-200 dark:hover:border-white/10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight className="h-5 w-5" /> : (
                        <div className="flex items-center gap-2">
                            <ChevronLeft className="h-5 w-5" />
                            <span className="text-xs font-black uppercase tracking-widest">Thu gọn</span>
                        </div>
                    )}
                </Button>
            </div>
        </aside>
    );
}
