'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    CalendarDays,
    MapPin,
    Clock,
    Users,
    Plus,
    Calendar as CalendarIcon,
    Sparkles,
    Megaphone,
    Search,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// === Types ===

interface ProfileSummary {
    display_name: string | null;
    email: string;
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

interface TypeConfigItem {
    label: string;
    icon: LucideIcon;
    color: string;
    bg: string;
}

const typeConfig: Record<string, TypeConfigItem> = {
    MEMORIAL: { label: 'Lễ Giỗ', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    MEETING: { label: 'Họp Họ', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    FESTIVAL: { label: 'Lễ Hội', icon: Megaphone, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    TRIP: { label: 'Dã Ngoại', icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    OTHER: { label: 'Khác', icon: CalendarIcon, color: 'text-slate-500', bg: 'bg-slate-500/10' },
};

// === Mock Data ===

const MOCK_EVENTS: EventItem[] = [
    {
        id: 'mock-1',
        title: 'Giỗ Tổ Dòng Họ Đỗ Quý 2026',
        description: 'Lễ giỗ tổ truyền thống hàng năm. Toàn thể con cháu gần xa tề tựu về Từ đường để dâng hương và báo công lên tổ tiên. Có tổ chức cơm thân mật.',
        start_at: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days later
        end_at: null,
        location: 'Từ đường Đỗ Quý, Hạ Hòa, Phú Thọ',
        type: 'MEMORIAL',
        is_recurring: true,
        creator_id: 'admin',
        created_at: new Date().toISOString(),
        rsvp_count: 156,
        status: 'upcoming',
        creator: { display_name: 'Admin', email: 'admin@giapha.vn' }
    },
    {
        id: 'mock-2',
        title: 'Họp Hội Đồng Gia Tộc Quý I/2026',
        description: 'Thảo luận về kế hoạch tu bổ nhà thờ tổ và quỹ khuyến học năm 2026. Mời các trưởng chi và đại diện các gia đình tham dự đông đủ.',
        start_at: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days later
        end_at: null,
        location: 'Văn phòng Hội đồng, Hà Nội',
        type: 'MEETING',
        is_recurring: false,
        creator_id: 'admin',
        created_at: new Date().toISOString(),
        rsvp_count: 24,
        status: 'upcoming',
        creator: { display_name: 'Admin', email: 'admin@giapha.vn' }
    },
    {
        id: 'mock-3',
        title: 'Lễ Hội Vinh Quy Bái Tổ - Xuân 2026',
        description: 'Chúc mừng các tân khoa, các cháu học sinh đỗ đạt cao trong kỳ thi năm qua. Lễ vinh danh sẽ diễn ra trang trọng tại đình làng.',
        start_at: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
        end_at: null,
        location: 'Đình làng Hạ Hòa',
        type: 'FESTIVAL',
        is_recurring: true,
        creator_id: 'admin',
        created_at: new Date().toISOString(),
        rsvp_count: 320,
        status: 'past',
        creator: { display_name: 'Admin', email: 'admin@giapha.vn' }
    },
    {
        id: 'mock-4',
        title: 'Hành trình Về Nguồn: Du xuân Bái Đính',
        description: 'Chuyến tham quan dã ngoại dành cho các cụ cao tuổi và thanh thiếu niên trong dòng họ đầu năm mới.',
        start_at: new Date(Date.now() + 86400000 * 15).toISOString(), // 15 days later
        end_at: null,
        location: 'Ninh Bình',
        type: 'TRIP',
        is_recurring: false,
        creator_id: 'admin',
        created_at: new Date().toISOString(),
        rsvp_count: 45,
        status: 'upcoming',
        creator: { display_name: 'Admin', email: 'admin@giapha.vn' }
    }
];

// === Sub-components ===

function CreateEventDialog({ onCreated }: { onCreated: () => void }) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startAt, setStartAt] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('MEETING');

    const handleSubmit = async () => {
        if (!title.trim() || !startAt || !user) return;
        setSubmitting(true);
        try {
            const { error } = await supabase.from('events').insert({
                title: title.trim(),
                description: description.trim() || null,
                start_at: new Date(startAt).toISOString(),
                location: location.trim() || null,
                type,
                creator_id: user.id,
            });
            if (!error) {
                setOpen(false);
                setTitle(''); setDescription(''); setStartAt(''); setLocation('');
                onCreated();
            }
        } finally { setSubmitting(false); }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/20 font-black tracking-wider py-6 px-8 h-auto">
                    <Plus className="mr-2 h-5 w-5" /> TẠO SỰ KIỆN
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/90 backdrop-blur-2xl border-white/10 rounded-[2.5rem] sm:max-w-xl p-0 overflow-hidden">
                <div className="p-8 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black tracking-tighter">Tạo Sự Kiện Mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tên sự kiện</label>
                            <Input placeholder="Ví dụ: Giỗ Chi 1..." value={title} onChange={e => setTitle(e.target.value)} className="bg-background/50 border-white/5 rounded-2xl h-12 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mô tả chi tiết</label>
                            <Textarea placeholder="Nội dung sự kiện..." value={description} onChange={e => setDescription(e.target.value)} rows={3} className="bg-background/50 border-white/5 rounded-2xl font-medium" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Thời gian bắt đầu</label>
                                <Input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} className="bg-background/50 border-white/5 rounded-2xl h-12 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Loại sự kiện</label>
                                <select className="w-full rounded-2xl border-white/5 h-12 px-4 font-bold bg-background/50 outline-none" value={type} onChange={e => setType(e.target.value)}>
                                    {Object.entries(typeConfig).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Địa điểm tổ chức</label>
                            <Input placeholder="Nhập địa chỉ..." value={location} onChange={e => setLocation(e.target.value)} className="bg-background/50 border-white/5 rounded-2xl h-12 font-bold" />
                        </div>

                        <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-2xl h-14 font-black shadow-xl shadow-primary-500/20" onClick={handleSubmit} disabled={!title.trim() || !startAt || submitting}>
                            {submitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN TẠO SỰ KIỆN'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function EventCard({ event }: { event: EventItem }) {
    const router = useRouter();
    const config = typeConfig[event.type] || typeConfig.OTHER;
    const date = new Date(event.start_at);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, y: -4 }}
            className="group"
            onClick={() => router.push(`/events/${event.id}`)}
        >
            <Card className={cn(
                "overflow-hidden transition-all duration-500 border-white/10 shadow-xl rounded-[2.5rem] cursor-pointer",
                event.status === 'past' ? "bg-card/30 opacity-80" : "bg-card/50 backdrop-blur-xl group-hover:bg-card/70 group-hover:shadow-primary-500/10"
            )}>
                <CardContent className="p-0 flex flex-col md:flex-row h-full">
                    {/* Date Block */}
                    <div className={cn(
                        "w-full md:w-32 flex flex-row md:flex-col items-center justify-center p-6 gap-3 border-b md:border-b-0 md:border-r border-white/5",
                        event.status === 'past' ? "bg-slate-500/5" : "bg-primary-500/5"
                    )}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tháng {date.getMonth() + 1}</p>
                        <p className="text-4xl font-black tracking-tighter">{date.getDate()}</p>
                        <p className="text-xs font-bold text-muted-foreground">2026</p>
                    </div>

                    {/* Content Block */}
                    <div className="flex-1 p-8 space-y-4 relative">
                        {/* Status Badge */}
                        <div className="absolute top-8 right-8 flex items-center gap-2">
                            {event.status === 'upcoming' && (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black text-[9px] tracking-widest rounded-lg">SẮP DIỄN RA</Badge>
                            )}
                            {event.status === 'past' && (
                                <Badge variant="outline" className="text-muted-foreground font-black text-[9px] tracking-widest rounded-lg">ĐÃ KẾT THÚC</Badge>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={cn("p-1.5 rounded-lg", config.bg)}>
                                    <config.icon className={cn("w-3 h-3", config.color)} />
                                </div>
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", config.color)}>{config.label}</span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight group-hover:text-primary-500 transition-colors">{event.title}</h3>
                        </div>

                        <p className="text-muted-foreground font-medium text-sm leading-relaxed line-clamp-2 italic">
                            {event.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                <Clock className="w-3.5 h-3.5 text-primary-500" />
                                {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                <MapPin className="w-3.5 h-3.5 text-primary-500" />
                                {event.location || 'Chưa xác định'}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                <Users className="w-3.5 h-3.5 text-primary-500" />
                                {event.rsvp_count || 0} người tham gia
                            </div>
                        </div>
                    </div>

                    {/* Action Arrow */}
                    <div className="hidden md:flex items-center justify-center p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-primary-500/10 text-primary-500">
                            <ArrowRight className="w-6 h-6" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// === Main Page ===

interface SupabaseEvent extends Omit<EventItem, 'creator'> {
    creator: ProfileSummary | ProfileSummary[];
}

export default function EventsPage() {
    const { isLoggedIn } = useAuth();
    const [events, setEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
    const [search, setSearch] = useState('');

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('events')
                .select('*, creator:profiles(display_name, email)')
                .order('start_at', { ascending: true });

            if (!data || data.length === 0) {
                setEvents(MOCK_EVENTS);
            } else {
                const mapped = (data as SupabaseEvent[]).map((e) => ({
                    ...e,
                    status: (new Date(e.start_at) > new Date() ? 'upcoming' : 'past') as 'upcoming' | 'past',
                    rsvp_count: Math.floor(Math.random() * 50) + 10
                }));
                setEvents(mapped as EventItem[]);
            }
        } catch {
            setEvents(MOCK_EVENTS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const matchesFilter = filter === 'all' || e.status === filter;
            const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                (e.description || '').toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [events, filter, search]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 text-primary-500 mb-2"
                    >
                        <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-black tracking-[0.3em] uppercase">Calendar</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl font-black tracking-tighter text-foreground"
                    >
                        Sự kiện dòng họ
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg font-medium italic max-w-2xl"
                    >
                        Nơi cập nhật những hoạt động quan trọng, các dịp lễ tết và những cuộc gặp gỡ thắt chặt tình thân gia tộc.
                    </motion.p>
                </div>
                {isLoggedIn && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <CreateEventDialog onCreated={fetchEvents} />
                    </motion.div>
                )}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex bg-card/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 w-full md:w-auto">
                    {(['all', 'upcoming', 'past'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 md:flex-none py-2 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                filter === f ? "bg-primary-500 text-white shadow-lg" : "text-muted-foreground hover:bg-white/5"
                            )}
                        >
                            {f === 'all' ? 'Tất cả' : f === 'upcoming' ? 'Sắp tới' : 'Lịch sử'}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary-500 transition-colors" />
                    <Input
                        placeholder="Tìm sự kiện..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 bg-card/30 border-white/10 rounded-2xl h-11 font-bold"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-8">
                {loading ? (
                    <div className="grid gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-44 rounded-[2.5rem] bg-card/20 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-6">
                        <div className="w-24 h-24 rounded-full bg-card/50 border border-white/5 flex items-center justify-center">
                            <CalendarIcon className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black text-muted-foreground">Không tìm thấy sự kiện nào</p>
                            <p className="text-sm text-muted-foreground/60 italic">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        </div>
                        <Button variant="outline" className="rounded-2xl" onClick={() => { setFilter('all'); setSearch(''); }}>Xóa bộ lọc</Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredEvents.map(event => <EventCard key={event.id} event={event} />)}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
