'use client';

import { useEffect, useState, useRef } from 'react';
import { TreePine, Users, Image as ImageIcon, Newspaper, CalendarDays, Sparkles, ArrowRight, BookOpen, Quote, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Stats {
    people: number;
    families: number;
    profiles: number;
    posts: number;
    events: number;
    media: number;
}

function StatCounter({ value, label, icon: Icon, delay = 0 }: { value: number; label: string; icon: LucideIcon; delay?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        const totalMiliseconds = 2000;
        const incrementTime = Math.abs(Math.floor(totalMiliseconds / (end || 1)));

        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            className="relative group p-6 rounded-3xl glass-card border-white/10 dark:border-white/5 hover:shadow-2xl hover:shadow-primary-500/10 transition-all border-glow overflow-hidden"
        >
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={120} />
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-500">
                    <Icon size={24} />
                </div>
                <p className="text-sm font-bold text-surface-500 dark:text-surface-400 uppercase tracking-widest">{label}</p>
            </div>

            <div className="flex items-baseline gap-1">
                <h3 className="text-4xl font-black text-surface-900 dark:text-white tracking-tighter">
                    {count.toLocaleString()}
                </h3>
                <span className="text-primary-500 font-black">+</span>
            </div>
        </motion.div>
    );
}

function AmbientOrb({ className, delay = 0 }: { className?: string; delay?: number }) {
    return (
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [0, 50, 0],
                y: [0, 30, 0],
            }}
            transition={{
                duration: 15,
                repeat: Infinity,
                delay,
                ease: "easeInOut"
            }}
            className={`absolute rounded-full blur-[100px] pointer-events-none -z-10 ${className}`}
        />
    );
}

export default function HomePage() {
    const [stats, setStats] = useState<Stats>({ people: 0, families: 0, profiles: 0, posts: 0, events: 0, media: 0 });
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const yHero = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

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
        }
        fetchStats();
    }, []);

    return (
        <div ref={containerRef} className="relative min-h-[150vh] pb-32 overflow-hidden lg:overflow-visible">
            {/* Ambient Background Elements */}
            <AmbientOrb className="top-[10%] left-[5%] w-[400px] h-[400px] bg-primary-500/20" />
            <AmbientOrb className="top-[40%] right-[10%] w-[300px] h-[300px] bg-accent-500/15" delay={2} />
            <AmbientOrb className="bottom-[20%] left-[15%] w-[500px] h-[500px] bg-blue-500/10" delay={5} />

            {/* --- Hero Section --- */}
            <section className="relative pt-12 md:pt-24 lg:pt-32 mb-20 overflow-visible">
                <motion.div
                    style={{ y: yHero, opacity: opacityHero }}
                    className="max-w-5xl mx-auto space-y-8 text-center px-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 backdrop-blur-md px-6 py-2 text-xs font-black text-primary-600 dark:text-primary-400 shadow-[0_0_20px_rgba(34,197,94,0.1)] mb-4"
                    >
                        <Sparkles className="h-4 w-4 animate-pulse" />
                        DIGITAL HERITAGE EXPERIENCE v2.0
                    </motion.div>

                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-5xl md:text-8xl font-black tracking-tight text-surface-900 dark:text-white leading-[1.1]"
                        >
                            Gia phả dòng họ
                            <span className="block italic text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-primary-600 to-accent-600 drop-shadow-sm">
                                Đỗ Quý
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 1 }}
                            className="text-lg md:text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto font-medium"
                        >
                            Kết nối cội nguồn, lưu giữ truyền thống qua công nghệ số. Nơi mỗi thành viên là một mảnh ghép của lịch sử hào hùng.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
                    >
                        <Link href="/tree">
                            <Button size="xl" className="h-14 px-8 rounded-2xl shadow-2xl shadow-primary-500/30 font-black text-lg gap-3">
                                <TreePine size={24} />
                                Khám phá Cây gia phả
                            </Button>
                        </Link>
                        <Link href="/book">
                            <Button variant="ghost" size="xl" className="h-14 px-8 rounded-2xl font-bold text-lg gap-2 border border-white/10 glass">
                                <BookOpen size={24} />
                                Xem Tộc thư
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* --- Stats Grid --- */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <StatCounter value={stats.people || 15} label="Thành viên dòng họ" icon={TreePine} delay={0.1} />
                    <StatCounter value={stats.families || 6} label="Gia đình" icon={Users} delay={0.2} />
                    <StatCounter value={stats.profiles || 5} label="Tài khoản hoạt động" icon={Sparkles} delay={0.3} />
                </div>
            </section>

            {/* --- Featured Content --- */}
            <section className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-12">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-surface-900 dark:text-white uppercase tracking-tighter">Bảng điều khiển chính</h2>
                        <p className="text-surface-500 font-medium">Truy cập nhanh vào các phân hệ của dòng họ</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        href="/feed"
                        icon={Newspaper}
                        title="Bảng tin Công tộc"
                        desc="Cập nhật những hoạt động, tin tức mới nhất từ dòng tộc Đỗ Quý."
                        color="text-orange-500"
                    />
                    <FeatureCard
                        href="/events"
                        icon={CalendarDays}
                        title="Việc Họ & Sự kiện"
                        desc="Quản lý ngày giỗ chạp, họp mặt và các sự kiện quan trọng trong năm."
                        color="text-indigo-500"
                    />
                    <FeatureCard
                        href="/media"
                        icon={ImageIcon}
                        title="Thư viện Tư liệu"
                        desc="Nơi lưu giữ hình ảnh sắc phong, di chúc và những khoảnh khắc quý giá."
                        color="text-pink-500"
                    />
                </div>
            </section>

            {/* --- Ambient Quote --- */}
            <section className="mt-40 text-center max-w-4xl mx-auto px-6 py-24 relative overflow-hidden rounded-[40px] glass overflow-visible">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none -z-10 bg-gradient-to-br from-primary-500 to-accent-600" />
                <Quote className="mx-auto mb-8 text-primary-500/40" size={64} />
                <h2 className="text-3xl md:text-4xl font-black italic tracking-tight text-surface-900 dark:text-white mb-6">
                    &ldquo;Chim có tổ, người có tông. Như cây có cội, như sông có nguồn.&rdquo;
                </h2>
                <div className="w-20 h-1.5 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full" />
            </section>
        </div>
    );
}

function FeatureCard({ href, icon: Icon, title, desc, color }: { href: string; icon: LucideIcon; title: string; desc: string; color: string }) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -5 }}
                className="group p-8 h-full rounded-3xl glass-card border-white/10 dark:border-white/5 hover:border-primary-500/50 transition-all flex flex-col gap-6"
            >
                <div className={`w-14 h-14 rounded-2xl bg-surface-100 dark:bg-white/5 flex items-center justify-center ${color} shadow-inner`}>
                    <Icon size={32} />
                </div>
                <div className="space-y-3">
                    <h3 className="text-xl font-black text-surface-900 dark:text-white flex items-center gap-2">
                        {title}
                        <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all text-primary-500" />
                    </h3>
                    <p className="text-surface-500 dark:text-surface-400 font-medium leading-relaxed">
                        {desc}
                    </p>
                </div>
            </motion.div>
        </Link>
    );
}
