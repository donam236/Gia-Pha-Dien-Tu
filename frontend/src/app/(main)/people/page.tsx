'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, ArrowRight, UserCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { fetchPeople, type TreeNode } from '@/lib/supabase-data';
import { motion, AnimatePresence } from 'framer-motion';

export default function PeopleListPage() {
    const router = useRouter();
    const [people, setPeople] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState<number | null>(null);
    const [livingFilter, setLivingFilter] = useState<boolean | null>(null);

    useEffect(() => {
        const loadPeople = async () => {
            setLoading(true);
            try {
                const data = await fetchPeople();
                setPeople(data);
            } catch (err) {
                console.error('Error loading people:', err);
            } finally {
                setLoading(false);
            }
        };
        loadPeople();
    }, []);

    const filtered = people.filter((p) => {
        if (search && !p.displayName.toLowerCase().includes(search.toLowerCase())) return false;
        if (genderFilter !== null && p.gender !== genderFilter) return false;
        if (livingFilter !== null && p.isLiving !== livingFilter) return false;
        return true;
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-transparent border border-primary-500/10"
            >
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-primary-500 shadow-lg shadow-primary-500/30">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <Badge variant="outline" className="bg-primary-500/10 border-primary-500/20 text-primary-600 font-bold px-3 py-1">
                                {people.length} THÀNH VIÊN
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-surface-900 dark:text-white mb-2">
                            Thành viên <span className="text-primary-500 italic">gia phả</span>
                        </h1>
                        <p className="text-surface-500 dark:text-surface-400 font-medium max-w-xl">
                            Danh sách chi tiết tất cả các thành viên trong dòng tộc, hỗ trợ tìm kiếm và lọc thông tin nhanh chóng.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="relative min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                            <Input
                                placeholder="Tìm kiếm tên thành viên..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-12 h-14 bg-white dark:bg-surface-950 border-surface-200 dark:border-white/10 rounded-2xl shadow-sm focus:ring-primary-500/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Decorative mesh */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[80px] -mr-32 -mt-32" />
            </motion.div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-8 items-center px-4">
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">Giới tính</span>
                    <div className="flex p-1.5 bg-surface-100 dark:bg-white/5 rounded-2xl border border-surface-200 dark:border-white/10">
                        <FilterButton active={genderFilter === null} onClick={() => setGenderFilter(null)} label="Tất cả" />
                        <FilterButton active={genderFilter === 1} onClick={() => setGenderFilter(1)} label="Nam" />
                        <FilterButton active={genderFilter === 2} onClick={() => setGenderFilter(2)} label="Nữ" />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">Trạng thái</span>
                    <div className="flex p-1.5 bg-surface-100 dark:bg-white/5 rounded-2xl border border-surface-200 dark:border-white/10">
                        <FilterButton active={livingFilter === null} onClick={() => setLivingFilter(null)} label="Tất cả" />
                        <FilterButton active={livingFilter === true} onClick={() => setLivingFilter(true)} label="Còn sống" />
                        <FilterButton active={livingFilter === false} onClick={() => setLivingFilter(false)} label="Đã mất" />
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <Card variant="glass" padding="none" className="overflow-hidden border-surface-200 dark:border-white/5">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-surface-50/50 dark:bg-white/5">
                            <TableRow className="hover:bg-transparent border-surface-100 dark:border-white/5">
                                <TableHead className="py-6 px-8 font-black text-xs uppercase tracking-widest text-surface-400">Họ tên</TableHead>
                                <TableHead className="py-6 font-black text-xs uppercase tracking-widest text-surface-400">Giới tính</TableHead>
                                <TableHead className="py-6 font-black text-xs uppercase tracking-widest text-surface-400">Đời</TableHead>
                                <TableHead className="py-6 font-black text-xs uppercase tracking-widest text-surface-400">Năm sinh</TableHead>
                                <TableHead className="py-6 font-black text-xs uppercase tracking-widest text-surface-400 text-right pr-8">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="relative w-12 h-12">
                                                    <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full" />
                                                    <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                                </div>
                                                <span className="text-surface-400 font-bold uppercase tracking-widest text-[10px]">Đang tải thành viên...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.map((p, index) => (
                                    <motion.tr
                                        key={p.handle}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="group hover:bg-primary-500/5 transition-colors cursor-pointer border-surface-100 dark:border-white/5"
                                        onClick={() => router.push(`/people/${p.handle}`)}
                                    >
                                        <TableCell className="py-5 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md",
                                                    p.gender === 1 ? "bg-primary-500 shadow-primary-500/20" : "bg-accent-500 shadow-accent-500/20"
                                                )}>
                                                    <UserCircle2 className="h-6 w-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-surface-900 dark:text-white flex items-center gap-2">
                                                        {p.displayName}
                                                        {p.isPrivacyFiltered && (
                                                            <Badge variant="outline" className="text-[8px] h-4 bg-amber-500/10 border-amber-500/20 text-amber-600 px-1 font-black">PRIVATE</Badge>
                                                        )}
                                                    </span>
                                                    <span className="text-xs font-bold text-surface-400">@{p.handle}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(
                                                "font-black text-[10px] tracking-widest uppercase px-3",
                                                p.gender === 1 ? "text-primary-500 border-primary-500/20 bg-primary-500/5" : "text-purple-500 border-purple-500/20 bg-purple-500/5"
                                            )}>
                                                {p.gender === 1 ? 'NAM' : 'NỮ'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-black text-surface-600 dark:text-surface-300">Đời {p.generation}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-surface-500">{p.birthYear || '—'}</span>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Button variant="ghost" size="sm" className="rounded-xl group-hover:bg-primary-500 group-hover:text-white transition-all">
                                                <span className="mr-2 font-black text-[10px] uppercase tracking-wider hidden sm:inline">Chi tiết</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>

                            {!loading && filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-6 rounded-full bg-surface-100 dark:bg-white/5">
                                                <Users className="h-12 w-12 text-surface-300" />
                                            </div>
                                            <h3 className="font-black text-xl text-surface-400">Không tìm thấy thành viên</h3>
                                            <p className="text-surface-400 max-w-xs mx-auto">
                                                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để thấy kết quả khác.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                active
                    ? "bg-white dark:bg-surface-800 text-primary-500 shadow-sm"
                    : "text-surface-400 hover:text-surface-900 dark:hover:text-white"
            )}
        >
            {label}
        </button>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}
