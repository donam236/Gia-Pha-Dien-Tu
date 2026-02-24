'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
    Image as ImageIcon,
    Upload,
    Search,
    Play,
    FileText,
    Download,
    Eye,
    Grid,
    List,
    MoreVertical,
    History,
    FileType,
    Sparkles,
    Calendar,
    Users,
    LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// --- Interfaces ---

interface MediaItem {
    id: string;
    file_name: string;
    mime_type: string | null;
    file_size: number | null;
    title: string | null;
    description: string | null;
    state: 'PENDING' | 'PUBLISHED' | 'REJECTED';
    type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    category: 'HISTORY' | 'CEREMONY' | 'MEETING' | 'PEOPLE';
    thumbnail_url: string | null;
    uploader_id: string | null;
    created_at: string;
    uploader?: { display_name: string | null; email: string };
}

// --- Mock Data ---

const MOCK_MEDIA: MediaItem[] = [
    {
        id: 'mock-1',
        file_name: 'gia-pha-co.jpg',
        mime_type: 'image/jpeg',
        file_size: 2400000,
        title: 'Bản sao Sắc phong cổ - Thế kỷ 18',
        description: 'Tài liệu quý hiếm lưu giữ sắc phong cho cụ tổ đời thứ 5.',
        state: 'PUBLISHED',
        type: 'IMAGE',
        category: 'HISTORY',
        thumbnail_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=800&auto=format&fit=crop',
        uploader_id: 'admin',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        uploader: { display_name: 'Đỗ Quý Nam', email: 'nam@doquy.vn' }
    },
    {
        id: 'mock-2',
        file_name: 'le-gio-to-2025.mp4',
        mime_type: 'video/mp4',
        file_size: 156000000,
        title: 'Toàn cảnh Lễ Giỗ Tổ năm Ất Tỵ 2025',
        description: 'Video ghi lại toàn bộ quy trình hành lễ và họp mặt con cháu tại nhà thờ tổ.',
        state: 'PUBLISHED',
        type: 'VIDEO',
        category: 'CEREMONY',
        thumbnail_url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800&auto=format&fit=crop',
        uploader_id: 'user-2',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        uploader: { display_name: 'Đỗ Quý Minh', email: 'minh@doquy.vn' }
    },
    {
        id: 'mock-3',
        file_name: 'toc-uoc-2024.pdf',
        mime_type: 'application/pdf',
        file_size: 1200000,
        title: 'Tộc ước dòng họ Đỗ Quý - Bản sửa đổi 2024',
        description: 'Văn bản quy định về các hoạt động và trách nhiệm của thành viên dòng họ.',
        state: 'PUBLISHED',
        type: 'DOCUMENT',
        category: 'HISTORY',
        thumbnail_url: null,
        uploader_id: 'admin',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        uploader: { display_name: 'Ban Quản Trị', email: 'admin@doquy.vn' }
    },
    {
        id: 'mock-4',
        file_name: 'hop-mat-ha-noi.jpg',
        mime_type: 'image/jpeg',
        file_size: 4500000,
        title: 'Họp mặt Chi họ tại Hà Nội - Thu 2024',
        description: 'Hình ảnh các thành viên chi họ tại Hà Nội tổ chức buổi gặp mặt thường niên.',
        state: 'PUBLISHED',
        type: 'IMAGE',
        category: 'MEETING',
        thumbnail_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
        uploader_id: 'user-3',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        uploader: { display_name: 'Đỗ Quý Hùng', email: 'hung@doquy.vn' }
    },
    {
        id: 'mock-5',
        file_name: 'ky-yeu-can-bo.pdf',
        mime_type: 'application/pdf',
        file_size: 8900000,
        title: 'Kỷ yếu Thành đạt Dòng họ Đỗ Quý',
        description: 'Tài liệu giới thiệu những thành viên ưu tú có đóng góp lớn cho xã hội và dòng họ.',
        state: 'PENDING',
        type: 'DOCUMENT',
        category: 'PEOPLE',
        thumbnail_url: null,
        uploader_id: 'user-4',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        uploader: { display_name: 'Đỗ Quý Lan', email: 'lan@doquy.vn' }
    }
];

// --- Config ---

const categoryConfig: Record<string, { label: string; icon: LucideIcon; color: string; bg: string }> = {
    HISTORY: { label: 'Lịch sử', icon: History, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    CEREMONY: { label: 'Lễ nghi', icon: Sparkles, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    MEETING: { label: 'Họp mặt', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    PEOPLE: { label: 'Nhân vật', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
};

const typeIcons: Record<string, LucideIcon> = {
    IMAGE: ImageIcon,
    VIDEO: Play,
    DOCUMENT: FileText,
};

export default function MediaLibraryPage() {
    const { user, isLoggedIn } = useAuth();
    const [items, setItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('media')
                .select('*, uploader:profiles(display_name, email)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Mix with mock for better demo
            const combined = [...(data || []), ...MOCK_MEDIA].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setItems(combined as MediaItem[]);
        } catch {
            setItems(MOCK_MEDIA);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMedia(); }, [fetchMedia]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = (item.title || '').toLowerCase().includes(search.toLowerCase()) ||
                (item.file_name || '').toLowerCase().includes(search.toLowerCase());
            const matchesType = filterType === 'ALL' || item.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [items, search, filterType]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setUploading(true);
        try {
            await supabase.from('media').insert({
                file_name: file.name,
                mime_type: file.type,
                file_size: file.size,
                state: 'PENDING',
                uploader_id: user.id,
            });
            fetchMedia();
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const formatSize = (bytes: number | null) => {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        <div className="p-4 rounded-3xl bg-primary-500/10 text-primary-500 shadow-2xl shadow-primary-500/20">
                            <ImageIcon className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter italic">Thư viện Tư liệu</h1>
                            <p className="text-muted-foreground font-medium ml-1">Lưu giữ ngàn đời những khoảnh khắc quý giá</p>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 bg-card/40 backdrop-blur-xl p-2 rounded-2xl border border-white/5"
                >
                    <div className="flex bg-white/5 p-1 rounded-xl">
                        <Button
                            variant={view === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="h-10 w-10 rounded-lg"
                            onClick={() => setView('grid')}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={view === 'list' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="h-10 w-10 rounded-lg"
                            onClick={() => setView('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="h-8 w-px bg-white/10 mx-1" />
                    {isLoggedIn && (
                        <>
                            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
                            <Button size="lg" className="rounded-xl font-black gap-2 shadow-xl shadow-primary-500/20" onClick={() => fileRef.current?.click()} disabled={uploading}>
                                <Upload className="h-5 w-5" />
                                {uploading ? 'ĐANG TẢI...' : 'TẢI LÊN'}
                            </Button>
                        </>
                    )}
                </motion.div>
            </header>

            {/* Filter & Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid md:grid-cols-12 gap-4 items-center"
            >
                <div className="md:col-span-4 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary-500 transition-colors" />
                    <Input
                        placeholder="Tìm kiếm tư liệu..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-14 pl-12 pr-4 bg-card/50 backdrop-blur-xl border-white/5 rounded-2xl font-bold focus-visible:ring-primary-500/20"
                    />
                </div>
                <div className="md:col-span-8">
                    <Tabs value={filterType} onValueChange={setFilterType} className="w-full">
                        <TabsList className="bg-card/40 backdrop-blur-xl border border-white/5 h-14 p-1.5 rounded-2xl w-full justify-start overflow-x-auto">
                            <TabsTrigger value="ALL" className="rounded-xl h-full font-bold px-6 data-[state=active]:bg-primary-500 data-[state=active]:text-white">Tất cả</TabsTrigger>
                            <TabsTrigger value="IMAGE" className="rounded-xl h-full font-bold px-6 gap-2"><ImageIcon className="h-4 w-4" /> Hình ảnh</TabsTrigger>
                            <TabsTrigger value="VIDEO" className="rounded-xl h-full font-bold px-6 gap-2"><Play className="h-4 w-4" /> Video</TabsTrigger>
                            <TabsTrigger value="DOCUMENT" className="rounded-xl h-full font-bold px-6 gap-2"><FileText className="h-4 w-4" /> Tài liệu</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </motion.div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
                    <p className="font-black text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Đang mở rương tư liệu...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <Card className="bg-card/20 backdrop-blur-xl border-dashed border-white/5 rounded-[3rem]">
                    <CardContent className="flex flex-col items-center justify-center py-32 opacity-50">
                        <div className="p-8 bg-white/5 rounded-full mb-6">
                            <FileType className="h-16 w-16" />
                        </div>
                        <h3 className="text-2xl font-black italic">Không tìm thấy tư liệu</h3>
                        <p className="text-muted-foreground font-medium mt-2">Hãy thử thay đổi từ khóa hoặc bộ lọc</p>
                    </CardContent>
                </Card>
            ) : view === 'grid' ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence>
                        {filteredItems.map((item, idx) => (
                            <MediaGridCard key={item.id} item={item} index={idx} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="text-left py-6 px-8 text-xs font-black uppercase tracking-widest text-muted-foreground">Tên tư liệu</th>
                                <th className="text-left py-6 px-8 text-xs font-black uppercase tracking-widest text-muted-foreground hidden md:table-cell">Danh mục</th>
                                <th className="text-left py-6 px-8 text-xs font-black uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Kích thước</th>
                                <th className="text-left py-6 px-8 text-xs font-black uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Ngày đăng</th>
                                <th className="text-right py-6 px-8 text-xs font-black uppercase tracking-widest text-muted-foreground">#</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item, idx) => (
                                <MediaListRow key={item.id} item={item} index={idx} formatSize={formatSize} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// --- Sub-components ---

function MediaGridCard({ item, index }: { item: MediaItem; index: number }) {
    const config = categoryConfig[item.category] || categoryConfig.HISTORY;
    const Icon = typeIcons[item.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            className="group relative"
        >
            <Card className="bg-card/40 backdrop-blur-3xl border-white/5 overflow-hidden rounded-[2.5rem] h-full transition-all group-hover:border-primary-500/30 group-hover:shadow-2xl group-hover:shadow-primary-500/10">
                {/* Preview Container */}
                <div className="aspect-[4/3] relative overflow-hidden bg-surface-100 dark:bg-white/5">
                    {item.thumbnail_url ? (
                        <img
                            src={item.thumbnail_url}
                            alt={item.title || ''}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20">
                            <Icon className="w-16 h-16" />
                        </div>
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={cn("rounded-lg font-black border-0 backdrop-blur-md shadow-lg", config.bg, config.color)}>
                            {config.label}
                        </Badge>
                    </div>

                    {item.type === 'VIDEO' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40 shadow-xl group-hover:scale-110 transition-transform">
                                <Play className="fill-white h-6 w-6 ml-1" />
                            </div>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <div className="flex gap-2 w-full">
                            <Button size="sm" className="flex-1 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 font-bold gap-2">
                                <Eye className="h-4 w-4" /> Xem
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-xl border-white/10 hover:bg-white/10 font-bold">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6 space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Icon className={cn("w-3.5 h-3.5", config.color)} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{item.type}</span>
                        </div>
                        <h3 className="text-xl font-black tracking-tighter truncate group-hover:text-primary-500 transition-colors">
                            {item.title || item.file_name}
                        </h3>
                    </div>

                    <p className="text-sm text-muted-foreground font-medium line-clamp-2 italic leading-relaxed">
                        {item.description || 'Không có mô tả cho phần tư liệu này.'}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-white/5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(item.created_at).getFullYear()}</span>
                        <span className="truncate max-w-[100px]">{item.uploader?.display_name || 'Hệ thống'}</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function MediaListRow({ item, index, formatSize }: { item: MediaItem; index: number; formatSize: (bytes: number | null) => string }) {
    const config = categoryConfig[item.category] || categoryConfig.HISTORY;
    const Icon = typeIcons[item.type];

    return (
        <motion.tr
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5"
        >
            <td className="py-5 px-8">
                <div className="flex items-center gap-4">
                    <div className={cn("p-2.5 rounded-xl shrink-0", config.bg)}>
                        <Icon className={cn("h-5 w-5", config.color)} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-black tracking-tight group-hover:text-primary-500 transition-colors truncate">{item.title || item.file_name}</p>
                        <p className="text-xs text-muted-foreground font-medium truncate">{item.mime_type}</p>
                    </div>
                </div>
            </td>
            <td className="py-5 px-8 hidden md:table-cell">
                <Badge className={cn("rounded-lg font-black border-0", config.bg, config.color)}>
                    {config.label}
                </Badge>
            </td>
            <td className="py-5 px-8 hidden lg:table-cell">
                <span className="text-sm font-bold opacity-60">{formatSize(item.file_size)}</span>
            </td>
            <td className="py-5 px-8 hidden sm:table-cell">
                <span className="text-sm font-bold opacity-60 text-nowrap">{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
            </td>
            <td className="py-5 px-8 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary-500/10 hover:text-primary-500"><Download className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10"><MoreVertical className="h-5 w-5" /></Button>
                </div>
            </td>
        </motion.tr>
    );
}
