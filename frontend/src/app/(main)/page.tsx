'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TreePine, Users, Image, Newspaper, CalendarDays, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface Stats {
    people: number;
    families: number;
    profiles: number;
    posts: number;
    events: number;
    media: number;
}

export default function HomePage() {
    const [stats, setStats] = useState<Stats>({ people: 0, families: 0, profiles: 0, posts: 0, events: 0, media: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const tables = ['people', 'families', 'profiles', 'posts', 'events', 'media'] as const;
                const counts: Record<string, number> = {};
                for (const t of tables) {
                    const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
                    counts[t] = count || 0;
                }
                setStats(counts as unknown as Stats);
            } catch { /* ignore */ }
            finally { setLoading(false); }
        }
        fetchStats();
    }, []);

    const cards = [
        { title: 'Thành viên gia phả', icon: TreePine, value: stats.people, desc: 'Người trong dòng họ', href: '/tree', color: 'text-primary-500' },
        { title: 'Dòng họ', icon: Users, value: stats.families, desc: 'Gia đình đã ghi nhận', href: '/tree', color: 'text-accent-500' },
        { title: 'Tài khoản', icon: Users, value: stats.profiles, desc: 'Thành viên tham gia', href: '/directory', color: 'text-blue-500' },
        { title: 'Bài viết', icon: Newspaper, value: stats.posts, desc: 'Tin tức & bảng tin', href: '/feed', color: 'text-orange-500' },
        { title: 'Sự kiện', icon: CalendarDays, value: stats.events, desc: 'Hoạt động sắp tới', href: '/events', color: 'text-indigo-500' },
        { title: 'Tư liệu', icon: Image, value: stats.media, desc: 'Hình ảnh & tài liệu', href: '/media', color: 'text-pink-500' },
    ];

    return (
        <div className="space-y-12 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-bold text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-400 shadow-sm mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    Hệ thống quản lý Gia phả điện tử
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-surface-900 dark:text-white">
                    Chào mừng đến với
                    <span className="block bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 bg-clip-text text-transparent italic">
                        Gia phả dòng họ Lê Huy
                    </span>
                </h1>
                <p className="text-lg text-surface-500 max-w-2xl">
                    Nơi lưu giữ linh hồn và truyền thống dòng họ, kết nối các thế hệ qua không gian và thời gian.
                </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((c, i) => (
                    <motion.div
                        key={c.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link href={c.href}>
                            <Card variant="glass" className="group h-full hover:shadow-2xl hover:shadow-primary-500/10 transition-all border-glow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className={`p-2 rounded-xl bg-surface-100 dark:bg-white/5 ${c.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                        <c.icon className="h-5 w-5" />
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-surface-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black mt-2 mb-1">{loading ? '...' : c.value.toLocaleString()}</div>
                                    <CardTitle className="text-base font-bold text-surface-700 dark:text-surface-200">{c.title}</CardTitle>
                                    <CardDescription className="text-xs">{c.desc}</CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card variant="bordered" padding="lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Bắt đầu nhanh</CardTitle>
                        <CardDescription>Truy cập nhanh các tính năng chính của hệ thống</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4">
                        <div className="flex flex-wrap gap-4">
                            <Link href="/tree">
                                <Button size="lg" className="shadow-lg shadow-primary-500/20 font-bold">
                                    <TreePine className="mr-2 h-5 w-5" />
                                    Xem cây gia phả
                                </Button>
                            </Link>
                            <Link href="/feed">
                                <Button variant="secondary" size="lg" className="font-bold">
                                    <Newspaper className="mr-2 h-5 w-5" />
                                    Bảng tin
                                </Button>
                            </Link>
                            <Link href="/events">
                                <Button variant="secondary" size="lg" className="font-bold">
                                    <CalendarDays className="mr-2 h-5 w-5" />
                                    Sự kiện
                                </Button>
                            </Link>
                            <Link href="/book">
                                <Button variant="outline" size="lg" className="font-bold border-glow">
                                    📖 Sách gia phả
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
