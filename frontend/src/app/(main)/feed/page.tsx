'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Newspaper,
    MessageCircle,
    PenSquare,
    Pin,
    Trash2,
    ChevronDown,
    Send,
    User,
    Calendar,
    Heart,
    Share2,
    MoreHorizontal,
    Megaphone,
    Users,
    Sparkles,
    Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// === Types ===

interface Post {
    id: string;
    author_id: string;
    type: 'general' | 'announcement' | 'event' | 'memory';
    title: string | null;
    body: string;
    is_pinned: boolean;
    status: string;
    created_at: string;
    updated_at: string;
    author?: { email: string; display_name: string | null; role: string; avatar_url?: string };
    comment_count?: number;
    likes_count?: number;
}

interface Comment {
    id: string;
    author_id: string;
    body: string;
    parent_id: string | null;
    created_at: string;
    author?: { email: string; display_name: string | null; avatar_url?: string };
}

// === Mock Data ===

const MOCK_POSTS: Post[] = [
    {
        id: 'mock-1',
        author_id: 'admin',
        type: 'announcement',
        title: 'Thông báo Giỗ Tổ Dòng Họ Đỗ Quý 2026',
        body: 'Kính mời toàn thể con cháu về dự lễ Giỗ Tổ vào ngày 15/3 âm lịch tới đây tại Từ đường dòng họ. Đây là dịp để chúng ta tri ân tiên tổ và thắt chặt tình đoàn kết.',
        is_pinned: true,
        status: 'published',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        author: { email: 'admin@giaphaduquy.vn', display_name: 'Ban Quản Trị', role: 'admin' },
        comment_count: 5,
        likes_count: 24
    },
    {
        id: 'mock-2',
        author_id: 'user-1',
        type: 'event',
        title: 'Mừng thọ Cụ Đỗ Quý Bình tròn 90 tuổi',
        body: 'Gia đình cháu xin trân trọng kính mời cô dì chú bác tới dự lễ mừng thọ nội tổ phụ vào cuối tuần này. Sự hiện diện của mọi người là niềm vinh dự cho gia đình.',
        is_pinned: false,
        status: 'published',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date().toISOString(),
        author: { email: 'binh@gmail.com', display_name: 'Đỗ Quý Nam', role: 'member' },
        comment_count: 12,
        likes_count: 45
    },
    {
        id: 'mock-3',
        author_id: 'user-2',
        type: 'memory',
        title: 'Tìm lại ảnh tư liệu xưa',
        body: 'Cháu vừa tìm thấy tấm ảnh Chi 2 chụp năm 1985 tại sân đình Hạ. Ai nhận ra người thân trong ảnh thì nhắn cháu nhé!',
        is_pinned: false,
        status: 'published',
        created_at: new Date(Date.now() - 432000000).toISOString(),
        updated_at: new Date().toISOString(),
        author: { email: 'lan@gmail.com', display_name: 'Nguyễn Thị Lan', role: 'member' },
        comment_count: 3,
        likes_count: 18
    }
];

// === Post Composer ===

function PostComposer({ onPostCreated }: { onPostCreated: () => void }) {
    const { user, isLoggedIn } = useAuth();
    const [body, setBody] = useState('');
    const [title, setTitle] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleSubmit = async () => {
        if (!body.trim() || !user) return;
        setSubmitting(true);
        try {
            const { error } = await supabase.from('posts').insert({
                author_id: user.id,
                title: title.trim() || null,
                body: body.trim(),
                type: 'general',
            });
            if (!error) {
                setBody('');
                setTitle('');
                setExpanded(false);
                onPostCreated();
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!isLoggedIn) return null;

    return (
        <Card className="overflow-hidden bg-card/50 backdrop-blur-xl border-white/10 shadow-2xl rounded-[1.5rem] group">
            <CardContent className="p-6 space-y-4">
                <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20 shrink-0">
                        <User className="h-6 w-6 text-primary-500" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <Input
                                        placeholder="Tiêu đề bài viết (tùy chọn)..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="bg-background/30 border-white/5 rounded-xl h-11 font-bold focus:border-primary-500/50"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <Textarea
                            placeholder="Chia sẻ niềm vui, sự kiện dòng họ với mọi người..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            onFocus={() => setExpanded(true)}
                            className="bg-transparent border-none p-0 focus-visible:ring-0 resize-none min-h-[60px] text-lg font-medium placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex items-center justify-between pt-4 border-t border-white/5"
                        >
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:bg-primary-500/10 hover:text-primary-500">
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Ảnh/Video
                                </Button>
                                <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:bg-primary-500/10 hover:text-primary-500">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Cảm xúc
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="font-bold" onClick={() => setExpanded(false)}>
                                    Hủy
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={!body.trim() || submitting}
                                    className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/20 px-6 font-bold"
                                >
                                    <PenSquare className="mr-2 h-4 w-4" />
                                    {submitting ? 'ĐANG ĐĂNG...' : 'ĐĂNG BÀI'}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}

// === Comment Section ===

function CommentSection({ postId }: { postId: string }) {
    const { user, isLoggedIn } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchComments = useCallback(async () => {
        if (postId.startsWith('mock')) {
            setComments([
                { id: 'c1', author_id: '1', body: 'Tuyệt vời quá cả nhà ơi!', created_at: new Date().toISOString(), parent_id: null, author: { email: 'a@a.com', display_name: 'Bác Hùng' } },
                { id: 'c2', author_id: '2', body: 'Chúc mừng dòng họ ta ngày càng phát đạt.', created_at: new Date().toISOString(), parent_id: null, author: { email: 'b@b.com', display_name: 'Chị Lan' } },
            ]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const { data } = await supabase
            .from('comments')
            .select('*, author:profiles(email, display_name, avatar_url)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
        if (data) setComments(data);
        setLoading(false);
    }, [postId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handleSubmit = async () => {
        if (!newComment.trim() || !user) return;
        const { error } = await supabase.from('comments').insert({
            post_id: postId,
            author_id: user.id,
            body: newComment.trim(),
        });
        if (!error) {
            setNewComment('');
            fetchComments();
        }
    };

    return (
        <div className="pt-4 space-y-4">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    comments.map((c) => (
                        <div key={c.id} className="flex gap-3 group/comment">
                            <div className="h-8 w-8 rounded-xl bg-muted/50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-border/50">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <div className="bg-muted/30 dark:bg-white/5 p-3 rounded-2xl rounded-tl-none border border-border/30 group-hover/comment:border-primary-500/20 transition-all">
                                    <p className="text-xs font-black text-primary-500 mb-1">{c.author?.display_name || c.author?.email?.split('@')[0]}</p>
                                    <p className="text-sm font-medium leading-relaxed">{c.body}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground mt-1 ml-2 font-bold uppercase tracking-tighter">
                                    {new Date(c.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {isLoggedIn && (
                <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Viết cảm nghĩ của bạn..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            className="bg-background/30 border-white/5 rounded-xl h-10 text-sm pr-10 focus:border-primary-500/50"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1 h-8 w-8 hover:bg-primary-500/10 text-primary-500"
                            onClick={handleSubmit}
                            disabled={!newComment.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// === Post Card ===

function PostCard({ post, onRefresh }: { post: Post; onRefresh: () => void }) {
    const { user, isAdmin } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    const handleDelete = async () => {
        if (post.id.startsWith('mock')) return;
        const { error } = await supabase.from('posts').delete().eq('id', post.id);
        if (!error) onRefresh();
    };

    const handleTogglePin = async () => {
        if (post.id.startsWith('mock')) return;
        const { error } = await supabase.from('posts').update({ is_pinned: !post.is_pinned }).eq('id', post.id);
        if (!error) onRefresh();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="group"
        >
            <Card className={cn(
                "overflow-hidden transition-all duration-500 border-white/10 shadow-xl rounded-[2rem]",
                post.is_pinned ? "bg-primary-500/5 border-primary-500/20" : "bg-card/50 backdrop-blur-xl"
            )}>
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center border border-primary-500/20 overflow-hidden">
                                    <User className="h-6 w-6 text-primary-500" />
                                </div>
                                {post.author?.role === 'admin' && (
                                    <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white p-0.5 rounded-full border-2 border-background">
                                        <Sparkles className="w-2 h-2" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-black text-foreground">{post.author?.display_name || post.author?.email?.split('@')[0] || 'Dấu tên'}</p>
                                    {post.author?.role === 'admin' && (
                                        <Badge variant="outline" className="text-[8px] h-4 bg-primary-500/10 border-primary-500/20 text-primary-500 font-black tracking-widest uppercase py-0">ADMIN</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(post.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    <span>•</span>
                                    <span>Chi Đỗ Quý</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {(isAdmin || user?.id === post.author_id) && !post.id.startsWith('mock') && (
                                <>
                                    {isAdmin && (
                                        <Button variant="ghost" size="icon" onClick={handleTogglePin} className="rounded-xl h-9 w-9">
                                            <Pin className={cn("h-4 w-4", post.is_pinned ? "text-primary-500 fill-primary-500" : "text-muted-foreground")} />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={handleDelete} className="rounded-xl h-9 w-9 text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 mb-6">
                        {post.is_pinned && (
                            <Badge className="bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 border-primary-500/20 font-black text-[9px] tracking-widest rounded-lg">
                                <Pin className="w-3 h-3 mr-1" />
                                TIN QUAN TRỌNG
                            </Badge>
                        )}
                        {post.title && (
                            <h3 className="text-xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                                {post.title}
                            </h3>
                        )}
                        <p className="text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">
                            {post.body}
                        </p>
                    </div>

                    {/* Meta/Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className={cn(
                                    "flex items-center gap-2 text-xs font-black tracking-widest transition-all",
                                    isLiked ? "text-rose-500" : "text-muted-foreground hover:text-primary-500"
                                )}
                            >
                                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                                {post.likes_count || 0}
                            </button>
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className="flex items-center gap-2 text-xs font-black tracking-widest text-muted-foreground hover:text-primary-500 transition-all"
                            >
                                <MessageCircle className="w-4 h-4" />
                                {post.comment_count || 0}
                            </button>
                            <button className="flex items-center gap-2 text-xs font-black tracking-widest text-muted-foreground hover:text-primary-500 transition-all">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-[10px] font-black tracking-widest text-primary-500 uppercase hover:bg-primary-500/5"
                            onClick={() => setShowComments(!showComments)}
                        >
                            Chi tiết
                            <ChevronDown className={cn("ml-1 h-3 w-3 transition-transform duration-500", showComments ? "rotate-180" : "")} />
                        </Button>
                    </div>

                    <AnimatePresence>
                        {showComments && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <CommentSection postId={post.id} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// === Main Feed Page ===

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('posts')
                .select('*, author:profiles(email, display_name, role, avatar_url)')
                .eq('status', 'published')
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            let finalPosts = data || [];

            // If No database posts, show mock data
            if (finalPosts.length === 0) {
                finalPosts = MOCK_POSTS;
            }

            // Get comment counts
            const postIds = finalPosts.map((p: Post) => p.id).filter(id => !id.startsWith('mock'));
            if (postIds.length > 0) {
                const { data: counts } = await supabase
                    .from('comments')
                    .select('post_id')
                    .in('post_id', postIds);
                const countMap: Record<string, number> = {};
                counts?.forEach((c: { post_id: string }) => {
                    countMap[c.post_id] = (countMap[c.post_id] || 0) + 1;
                });
                finalPosts.forEach((p: Post) => {
                    if (!p.id.startsWith('mock')) {
                        p.comment_count = countMap[p.id] || 0;
                    }
                });
            }
            setPosts(finalPosts);
        } catch {
            setPosts(MOCK_POSTS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12">
            {/* Left Content: Feed */}
            <div className="flex-1 space-y-8">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 text-primary-500 mb-2">
                            <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20">
                                <Newspaper className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-black tracking-[0.3em] uppercase">News Feed</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground">Bảng tin dòng họ</h1>
                        <p className="text-muted-foreground font-medium mt-1 italic">Nơi lưu giữ mạch sống và hơi thở của gia đình Đỗ Quý.</p>
                    </div>
                </div>

                <PostComposer onPostCreated={fetchPosts} />

                <div className="space-y-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin shadow-2xl shadow-primary-500/20" />
                            <p className="text-xs font-black tracking-widest text-muted-foreground uppercase animate-pulse">Đang kết nối mạch truyền thống...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} onRefresh={fetchPosts} />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Right Content: Sidebar (Premium Widgets) */}
            <div className="hidden lg:block w-[350px] space-y-8 pt-24">
                {/* Stats Widget */}
                <Card className="bg-gradient-to-br from-primary-500 to-primary-600 border-none text-white overflow-hidden relative shadow-2xl shadow-primary-500/20 rounded-[2.5rem]">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                    <CardContent className="p-8 relative z-10 space-y-6">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 opacity-80" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sức mạnh dòng họ</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-3xl font-black">1.2k+</p>
                                <p className="text-[9px] font-bold uppercase opacity-70">Thành viên</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-black">240</p>
                                <p className="text-[9px] font-bold uppercase opacity-70">Gia đình</p>
                            </div>
                            <div className="space-y-1 border-t border-white/10 pt-4">
                                <p className="text-3xl font-black">12</p>
                                <p className="text-[9px] font-bold uppercase opacity-70">Đời chi lẻ</p>
                            </div>
                            <div className="space-y-1 border-t border-white/10 pt-4">
                                <p className="text-3xl font-black">8.5</p>
                                <p className="text-[9px] font-bold uppercase opacity-70">Độ gắn kết</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Events Widget */}
                <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-primary-500">
                                <Calendar className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Sự kiện sắp tới</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] font-black text-muted-foreground uppercase hover:text-primary-500">Xem tất cả</Button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: 'Giỗ Tổ Dòng Họ', date: 'Thứ Bảy, 15/03', type: 'Grand' },
                                { title: 'Họp Hội Đồng Gia Tộc', date: 'Chủ Nhật, 22/03', type: 'Internal' }
                            ].map((e, idx) => (
                                <div key={idx} className="flex gap-4 group/event cursor-pointer">
                                    <div className="h-12 w-12 rounded-2xl bg-muted/50 dark:bg-white/5 border border-border/50 flex flex-col items-center justify-center shrink-0 group-hover/event:border-primary-500/50 transition-colors">
                                        <span className="text-[10px] font-black text-primary-500">T3</span>
                                        <span className="text-lg font-black leading-none">15</span>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-xs font-black text-foreground group-hover/event:text-primary-500 transition-colors">{e.title}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold">{e.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Announcement Box */}
                <div className="p-8 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 relative overflow-hidden group">
                    <Megaphone className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-500/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <div className="relative z-10">
                        <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Ghi chú Admin
                        </p>
                        <p className="text-sm font-medium leading-relaxed italic text-amber-600 dark:text-amber-400">
                            &quot;Mọi đóng góp hình ảnh tư liệu đều được ghi danh vào Sổ Vàng dòng họ.&quot;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
