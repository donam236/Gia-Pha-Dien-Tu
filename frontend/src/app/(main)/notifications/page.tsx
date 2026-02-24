'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Bell,
    CheckCheck,
    ExternalLink,
    MessageSquare,
    Calendar,
    UserPlus,
    Settings,
    Sparkles,
    Clock,
    Trash2,
    CheckCircle2,
    LucideIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// --- Interfaces ---

interface ProfileSummary {
    id: string;
    display_name: string | null;
    avatar_url?: string | null;
}

interface NotificationItem {
    id: string;
    type: 'NEW_POST' | 'NEW_COMMENT' | 'EVENT_INVITE' | 'RSVP_UPDATE' | 'SYSTEM' | 'NEW_MEMBER';
    title: string;
    message: string;
    link_url: string | null;
    is_read: boolean;
    created_at: string;
    actor?: ProfileSummary;
}

// --- Mock Data ---

const MOCK_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 'mock-1',
        type: 'EVENT_INVITE',
        title: 'Thư mời: Lễ kỷ niệm Ngày Giỗ Tổ',
        message: 'Bạn đã được mời tham dự Lễ Giỗ Tổ dòng họ Đỗ Quý diễn ra vào tháng tới.',
        link_url: '/events/mock-memorial-2026',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        actor: { id: 'admin', display_name: 'Đỗ Quý Nam', avatar_url: null }
    },
    {
        id: 'mock-2',
        type: 'NEW_MEMBER',
        title: 'Thành viên mới gia nhập',
        message: 'Chào mừng Đỗ Quý Minh đã chính thức gia nhập cây gia phả kỹ thuật số.',
        link_url: '/people/do-quy-minh',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        actor: { id: 'user-2', display_name: 'Đỗ Quý Minh', avatar_url: null }
    },
    {
        id: 'mock-3',
        type: 'SYSTEM',
        title: 'Cập nhật hệ thống v2.1',
        message: 'Hệ thống đã được nâng cấp giao diện Glassmorphism cao cấp. Chúc bạn trải nghiệm tốt.',
        link_url: '/',
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
        id: 'mock-4',
        type: 'NEW_POST',
        title: 'Thông báo mới trên Bảng tin',
        message: 'Đỗ Quý Hùng vừa đăng một bài viết mới về lịch sử dòng tộc tại Hải Dương.',
        link_url: '/feed',
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        actor: { id: 'user-3', display_name: 'Đỗ Quý Hùng', avatar_url: null }
    }
];

// --- Config ---

const typeConfig: Record<string, { icon: LucideIcon; color: string; bg: string; label: string }> = {
    NEW_POST: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Bài viết' },
    NEW_COMMENT: { icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-500/10', label: 'Bình luận' },
    EVENT_INVITE: { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Sự kiện' },
    RSVP_UPDATE: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'RSVP' },
    SYSTEM: { icon: Settings, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Hệ thống' },
    NEW_MEMBER: { icon: UserPlus, color: 'text-violet-500', bg: 'bg-violet-500/10', label: 'Thành viên' },
};

export default function NotificationsPage() {
    const router = useRouter();
    const { user, isLoggedIn } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!isLoggedIn) {
            setNotifications(MOCK_NOTIFICATIONS);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            if (data && data.length > 0) {
                setNotifications(data as NotificationItem[]);
            } else {
                setNotifications(MOCK_NOTIFICATIONS);
            }
        } catch {
            setNotifications(MOCK_NOTIFICATIONS);
        } finally {
            setLoading(false);
        }
    }, [user, isLoggedIn]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);

    const markAsRead = async (id: string) => {
        if (!id.startsWith('mock-') && isLoggedIn) {
            await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        }
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const markAllAsRead = async () => {
        if (isLoggedIn && user) {
            await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
        }
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 px-4 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-1">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-500">
                            <Bell className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter italic">Thông báo</h1>
                    </motion.div>
                    <p className="text-muted-foreground font-medium ml-14">
                        {unreadCount > 0 ? (
                            <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                                Bạn có <span className="text-primary-500 font-black">{unreadCount}</span> thông báo mới chưa đọc
                            </span>
                        ) : 'Bạn đã cập nhật mọi tin tức dòng họ'}
                    </p>
                </div>

                {unreadCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="rounded-xl font-bold text-xs uppercase tracking-widest gap-2 bg-white/5 hover:bg-white/10"
                        >
                            <CheckCheck className="h-4 w-4 text-primary-500" />
                            Đánh dấu tất cả đã đọc
                        </Button>
                    </motion.div>
                )}
            </header>

            {/* List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
                            <Bell className="h-10 w-10 text-primary-500 animate-bounce relative z-10" />
                        </div>
                        <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Đang tải tin tức...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="bg-card/30 backdrop-blur-xl border-dashed border-white/10 rounded-[2.5rem] overflow-hidden">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-6 rounded-full bg-primary-500/5 mb-6">
                                    <Sparkles className="h-12 w-12 text-primary-500/50" />
                                </div>
                                <h3 className="text-xl font-black italic">Hộp thư trống</h3>
                                <p className="text-muted-foreground max-w-xs mt-2">Tuyệt vời! Bạn không còn thông báo nào cần xử lý lúc này.</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {notifications.map((notif, index) => {
                                const config = typeConfig[notif.type] || { icon: Bell, color: 'text-primary-500', bg: 'bg-primary-500/10', label: 'Thông báo' };
                                return (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, x: -20, y: 10 }}
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        transition={{ delay: index * 0.05 }}
                                        layout
                                        className="group"
                                    >
                                        <Card
                                            className={cn(
                                                "relative cursor-pointer transition-all duration-300 border-white/5 rounded-[2rem] overflow-hidden group",
                                                !notif.is_read
                                                    ? "bg-primary-500/5 hover:bg-primary-500/10 border-primary-500/20 shadow-lg shadow-primary-500/5"
                                                    : "bg-card/40 hover:bg-card/60 grayscale-[0.3] hover:grayscale-0"
                                            )}
                                        >
                                            <CardContent className="p-6 flex items-start gap-4">
                                                {/* Type Icon */}
                                                <div className={cn("p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110", config.bg)}>
                                                    <config.icon className={cn("w-5 h-5", config.color)} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0 space-y-1" onClick={() => {
                                                    if (!notif.is_read) markAsRead(notif.id);
                                                    if (notif.link_url) router.push(notif.link_url);
                                                }}>
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn("text-[10px] font-black uppercase tracking-widest italic", config.color)}>
                                                            {config.label}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[10px]">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(notif.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <h3 className={cn("text-lg font-black tracking-tight", !notif.is_read ? "text-foreground" : "text-muted-foreground")}>
                                                            {notif.title}
                                                        </h3>
                                                        {!notif.is_read && (
                                                            <div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-balance text-muted-foreground line-clamp-2 italic font-medium">
                                                        {notif.message}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {notif.link_url && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5 hover:bg-primary-500/20 hover:text-primary-500">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full bg-white/5 hover:bg-rose-500/20 hover:text-rose-500"
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
