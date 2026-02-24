'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    MapPin,
    Clock,
    Users,
    ArrowLeft,
    Check,
    X,
    HelpCircle,
    Loader2,
    Sparkles,
    Megaphone,
    Bell,
    Share2,
    Calendar,
    MessageSquare,
    User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';

// === Types ===

interface ProfileSummary {
    id: string;
    display_name: string | null;
    email: string;
    avatar_url?: string | null;
}

interface EventItem {
    id: string;
    title: string;
    description: string | null;
    start_at: string;
    end_at: string | null;
    location: string | null;
    type: 'MEMORIAL' | 'MEETING' | 'FESTIVAL' | 'TRIP' | 'OTHER';
    is_recurring: boolean;
    creator_id: string;
    created_at: string;
    creator?: ProfileSummary;
    rsvp_count?: number;
    status: 'upcoming' | 'ongoing' | 'past';
}

interface RSVP {
    id: string;
    event_id: string;
    user_id: string;
    status: 'GOING' | 'MAYBE' | 'NOT_GOING';
    user: ProfileSummary;
}

const typeConfig: Record<string, { label: string; icon: LucideIcon; color: string; bg: string }> = {
    MEMORIAL: { label: 'Lễ Giỗ', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    MEETING: { label: 'Họp Họ', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    FESTIVAL: { label: 'Lễ Hội', icon: Megaphone, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    TRIP: { label: 'Dã Ngoại', icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    OTHER: { label: 'Sự kiện khác', icon: Calendar, color: 'text-slate-500', bg: 'bg-slate-500/10' },
};

const rsvpOptions = [
    { status: 'GOING', label: 'Tham dự', icon: Check, color: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
    { status: 'MAYBE', label: 'Có thể', icon: HelpCircle, color: 'bg-amber-500', hover: 'hover:bg-amber-600' },
    { status: 'NOT_GOING', label: 'Bận', icon: X, color: 'bg-rose-500', hover: 'hover:bg-rose-600' },
];

// === Mock Data (Shared with Main Page) ===

const MOCK_EVENTS: EventItem[] = [
    {
        id: 'mock-1',
        title: 'Giỗ Tổ Dòng Họ Đỗ Quý 2026',
        description: 'Lễ giỗ tổ truyền thống hàng năm. Toàn thể con cháu gần xa tề tựu về Từ đường để dâng hương và báo công lên tổ tiên. Có tổ chức cơm thân mật.',
        start_at: new Date(Date.now() + 86400000 * 5).toISOString(),
        end_at: null,
        location: 'Từ đường Đỗ Quý, Hạ Hòa, Phú Thọ',
        type: 'MEMORIAL',
        is_recurring: true,
        creator_id: 'admin',
        created_at: new Date().toISOString(),
        rsvp_count: 156,
        status: 'upcoming'
    },
    // ... other mocks can be retrieved if needed
];

const MOCK_RSVPS: RSVP[] = [
    { id: 'r1', event_id: 'mock-1', user_id: 'u1', status: 'GOING', user: { id: 'u1', display_name: 'Đỗ Quý Nam', email: 'nam.do@gmail.com' } },
    { id: 'r2', event_id: 'mock-1', user_id: 'u2', status: 'GOING', user: { id: 'u2', display_name: 'Đỗ Thị Lan', email: 'lan.do@outlook.com' } },
    { id: 'r3', event_id: 'mock-1', user_id: 'u3', status: 'MAYBE', user: { id: 'u3', display_name: 'Đỗ Quý Khoa', email: 'khoa.do@student.edu.vn' } },
];

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoggedIn } = useAuth();
    const [event, setEvent] = useState<EventItem | null>(null);
    const [rsvps, setRsvps] = useState<RSVP[]>([]);
    const [myRsvp, setMyRsvp] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchEvent = useCallback(async () => {
        if (!params.id) return;
        setLoading(true);

        // Try DB first
        try {
            const { data } = await supabase
                .from('events')
                .select('*, creator:profiles(display_name, email)')
                .eq('id', params.id)
                .single();

            if (data) {
                setEvent({
                    ...data,
                    status: new Date(data.start_at) > new Date() ? 'upcoming' : 'past'
                } as EventItem);
            } else {
                // Fallback to mock
                const mock = MOCK_EVENTS.find(m => m.id === params.id);
                if (mock) {
                    setEvent(mock);
                    setRsvps(MOCK_RSVPS);
                }
            }

            // Fetch RSVPs if DB event or mock
            if (data) {
                const { data: rsvpData } = await supabase
                    .from('event_rsvps')
                    .select('*, user:profiles(id, display_name, email, avatar_url)')
                    .eq('event_id', params.id);

                if (rsvpData) {
                    setRsvps(rsvpData as RSVP[]);
                    if (user) {
                        const mine = (rsvpData as RSVP[]).find((r) => r.user_id === user.id);
                        if (mine) setMyRsvp(mine.status);
                    }
                }
            }
        } catch {
            const mock = MOCK_EVENTS.find(m => m.id === params.id);
            if (mock) {
                setEvent(mock);
                setRsvps(MOCK_RSVPS);
            }
        } finally {
            setLoading(false);
        }
    }, [params.id, user]);

    useEffect(() => { fetchEvent(); }, [fetchEvent]);

    const handleRsvp = async (status: string) => {
        if (!user || !params.id || params.id.toString().startsWith('mock-')) return;
        const { error } = await supabase
            .from('event_rsvps')
            .upsert({ event_id: params.id, user_id: user.id, status }, { onConflict: 'event_id,user_id' });
        if (!error) {
            setMyRsvp(status);
            fetchEvent();
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                <p className="text-xs font-black tracking-widest uppercase text-muted-foreground animate-pulse">Đang tải chi tiết sự kiện...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center">
                <h1 className="text-2xl font-black mb-4">Sự kiện này hiện không khả dụng</h1>
                <Button onClick={() => router.push('/events')}>Quay lại danh sách</Button>
            </div>
        );
    }

    const config = typeConfig[event.type] || typeConfig.OTHER;
    const date = new Date(event.start_at);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            {/* Back & Navigation */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Button
                    variant="ghost"
                    className="rounded-xl hover:bg-primary-500/5 text-muted-foreground hover:text-primary-500 font-bold"
                    onClick={() => router.push('/events')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Tất cả sự kiện
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 space-y-8"
                >
                    <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                        <div className="h-48 bg-gradient-to-br from-primary-600 to-primary-800 relative">
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <config.icon className="w-24 h-24 text-white/10" />
                            </div>
                            <div className="absolute -bottom-10 left-10 p-4 rounded-3xl bg-card border-4 border-card shadow-2xl">
                                <div className={cn("p-6 rounded-2xl flex flex-col items-center", config.bg)}>
                                    <span className="text-xs font-black text-muted-foreground">THÁNG {date.getMonth() + 1}</span>
                                    <span className="text-3xl font-black tracking-tighter">{date.getDate()}</span>
                                </div>
                            </div>
                        </div>

                        <CardContent className="pt-16 pb-12 px-10 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Badge className={cn("rounded-lg font-black text-[9px] tracking-widest px-3", config.bg, config.color)}>
                                        {config.label}
                                    </Badge>
                                    {event.status === 'past' && <Badge variant="outline" className="font-bold text-[9px] tracking-widest">ĐÃ KẾT THÚC</Badge>}
                                </div>
                                <h1 className="text-4xl font-black tracking-tighter leading-tight italic">{event.title}</h1>

                                <p className="text-muted-foreground font-medium text-lg leading-relaxed italic">
                                    &quot;{event.description}&quot;
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-white/5">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Thời gian</span>
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-primary-500" />
                                        <span className="font-bold">{date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Địa điểm</span>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-primary-500" />
                                        <span className="font-bold underline decoration-primary-500/30 underline-offset-4">{event.location || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* RSVP Action */}
                            {isLoggedIn && event.status === 'upcoming' && (
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-2 text-primary-500">
                                        <Bell className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Xác nhận tham dự</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {rsvpOptions.map(opt => (
                                            <Button
                                                key={opt.status}
                                                variant={myRsvp === opt.status ? 'default' : 'outline'}
                                                className={cn(
                                                    "rounded-2xl h-14 font-black transition-all",
                                                    myRsvp === opt.status ? cn(opt.color, "text-white shadow-lg") : "bg-muted/10 border-white/5"
                                                )}
                                                onClick={() => handleRsvp(opt.status)}
                                            >
                                                <opt.icon className="mr-2 h-4 w-4" />
                                                <span className="hidden sm:inline">{opt.label}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Sidebar Info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    {/* Attendees List */}
                    <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/30 px-6 py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Con cháu đăng ký</CardTitle>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-500">
                                <Users className="h-3 w-3" />
                                <span className="text-[10px] font-black">{rsvps.filter(r => r.status === 'GOING').length}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                            <div className="divide-y divide-white/5">
                                {rsvps.length === 0 ? (
                                    <div className="p-10 text-center space-y-2">
                                        <User className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                                        <p className="text-xs font-bold text-muted-foreground italic">Chưa có ai đăng ký</p>
                                    </div>
                                ) : (
                                    rsvps.map((rsvp) => (
                                        <div key={rsvp.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 group-hover:scale-110 transition-transform">
                                                    {rsvp.user.avatar_url ? (
                                                        <Image src={rsvp.user.avatar_url} alt={rsvp.user.display_name || ''} width={40} height={40} className="rounded-xl object-cover" />
                                                    ) : (
                                                        <User className="h-5 w-5 text-primary-500" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black tracking-tight">{rsvp.user.display_name || rsvp.user.email.split('@')[0]}</span>
                                                    <span className="text-[10px] font-medium text-muted-foreground">
                                                        {rsvp.status === 'GOING' ? 'Sẽ tham dự' : rsvp.status === 'MAYBE' ? 'Đang cân nhắc' : 'Vắng mặt'}
                                                    </span>
                                                </div>
                                            </div>
                                            {rsvp.status === 'GOING' && <Check className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Tools */}
                    <div className="space-y-3">
                        <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 font-bold justify-start px-6 bg-card/50">
                            <Share2 className="mr-3 h-4 w-4 text-blue-500" /> Chia sẻ nội dung
                        </Button>
                        <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 font-bold justify-start px-6 bg-card/50">
                            <MessageSquare className="mr-3 h-4 w-4 text-emerald-500" /> Thảo luận (12)
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
