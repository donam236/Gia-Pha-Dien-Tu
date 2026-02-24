'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Contact,
    Search,
    MapPin,
    User,
    Phone,
    Mail,
    Briefcase,
    Users,
    Filter,
    ArrowUpDown,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

// === Types ===

interface ProfileResponse {
    id: string;
    display_name: string | null;
    email: string;
    avatar_url: string | null;
    role: 'admin' | 'member' | 'viewer';
    generation?: number;
    chi?: number;
    occupation?: string;
    current_address?: string;
}

interface Member {
    id: string;
    handle?: string;
    display_name: string;
    email?: string;
    phone?: string;
    avatar_url?: string | null;
    role: 'admin' | 'member' | 'viewer';
    generation: number;
    chi: number;
    current_address?: string;
    occupation?: string;
    is_living: boolean;
    status: 'active' | 'inactive';
}

// === Mock Data ===

const MOCK_MEMBERS: Member[] = [
    {
        id: '1',
        handle: 'P001',
        display_name: 'Đỗ Quý Nam',
        email: 'nam.do@gmail.com',
        phone: '0987.654.321',
        role: 'admin',
        generation: 4,
        chi: 1,
        current_address: 'Cầu Giấy, Hà Nội',
        occupation: 'Kỹ sư AI',
        is_living: true,
        status: 'active'
    },
    {
        id: '2',
        handle: 'P002',
        display_name: 'Đỗ Quý Bình',
        email: 'binh.do@yahoo.com',
        phone: '0912.345.678',
        role: 'member',
        generation: 2,
        chi: 1,
        current_address: 'Hải Phòng',
        occupation: 'Nhà giáo (Hưu trí)',
        is_living: true,
        status: 'active'
    },
    {
        id: '3',
        handle: 'P003',
        display_name: 'Đỗ Quý Hải',
        email: 'hai.do@company.vn',
        phone: '0903.111.222',
        role: 'member',
        generation: 3,
        chi: 1,
        current_address: 'Quận 1, TP. HCM',
        occupation: 'Giám đốc Điều hành',
        is_living: true,
        status: 'active'
    },
    {
        id: '4',
        handle: 'P004',
        display_name: 'Đỗ Thị Lan',
        email: 'lan.do@outlook.com',
        phone: '0945.777.888',
        role: 'member',
        generation: 3,
        chi: 2,
        current_address: 'Hải Dương',
        occupation: 'Bác sĩ',
        is_living: true,
        status: 'active'
    },
    {
        id: '5',
        handle: 'P005',
        display_name: 'Đỗ Quý Khoa',
        email: 'khoa.do@student.edu.vn',
        phone: '0888.999.000',
        role: 'member',
        generation: 4,
        chi: 2,
        current_address: 'Đà Nẵng',
        occupation: 'Sinh viên',
        is_living: true,
        status: 'active'
    },
    {
        id: '6',
        handle: 'P006',
        display_name: 'Đỗ Quý Minh',
        email: 'minh.creative@design.com',
        phone: '0977.666.555',
        role: 'member',
        generation: 5,
        chi: 1,
        current_address: 'Thanh Xuân, Hà Nội',
        occupation: 'Kiến trúc sư',
        is_living: true,
        status: 'active'
    }
];

export default function DirectoryPage() {
    const router = useRouter();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedChi, setSelectedChi] = useState<number | 'all'>('all');
    const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            // In a real app, join profiles with people
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .order('display_name', { ascending: true });

            // For now, if no data, use mock
            if (!data || data.length === 0) {
                setMembers(MOCK_MEMBERS);
            } else {
                // Map real data to our interface
                const mapped = data.map((d: ProfileResponse) => ({
                    ...d,
                    display_name: d.display_name || d.email.split('@')[0],
                    generation: d.generation || Math.floor(Math.random() * 5) + 1,
                    chi: d.chi || Math.floor(Math.random() * 3) + 1,
                    occupation: d.occupation || 'Thành viên dòng họ',
                    current_address: d.current_address || 'Việt Nam',
                    is_living: true,
                    status: 'active' as const
                }));
                setMembers(mapped);
            }
        } catch {
            setMembers(MOCK_MEMBERS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMembers(); }, [fetchMembers]);

    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            const matchesSearch =
                (m.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
                (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
                (m.occupation || '').toLowerCase().includes(search.toLowerCase()) ||
                (m.current_address || '').toLowerCase().includes(search.toLowerCase());

            const matchesChi = selectedChi === 'all' || m.chi === selectedChi;
            const matchesGen = selectedGen === 'all' || m.generation === selectedGen;

            return matchesSearch && matchesChi && matchesGen;
        });
    }, [members, search, selectedChi, selectedGen]);

    const generations = useMemo(() => Array.from(new Set(members.map(m => m.generation))).sort((a, b) => a - b), [members]);
    const chiGroups = useMemo(() => Array.from(new Set(members.map(m => m.chi))).sort((a, b) => a - b), [members]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 text-primary-500 mb-2"
                    >
                        <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20">
                            <Contact className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-black tracking-[0.3em] uppercase">Directory</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl font-black tracking-tighter text-foreground"
                    >
                        Danh bạ dòng họ
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground font-medium mt-1 italic"
                    >
                        Kết nối, sẻ chia và gìn giữ mối liên hệ giữa các thành viên.
                    </motion.p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="rounded-2xl border-white/10 bg-card/50 backdrop-blur-xl font-bold">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Sắp xếp
                    </Button>
                    <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/20 font-bold">
                        <Users className="mr-2 h-4 w-4" />
                        Thống kê
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <Card className="bg-card/30 backdrop-blur-2xl border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Search */}
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary-500" />
                            <Input
                                placeholder="Tìm theo tên, nghề nghiệp, địa chỉ..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-12 bg-background/30 border-white/5 rounded-2xl h-12 text-lg font-medium focus:border-primary-500/50 transition-all shadow-inner"
                            />
                        </div>

                        {/* Dropdown Filters */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <select
                                    className="bg-background/50 border-white/10 rounded-xl px-3 py-2 text-sm font-bold focus:ring-primary-500/50 outline-none"
                                    value={selectedChi}
                                    onChange={e => setSelectedChi(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                >
                                    <option value="all">Tất cả Chi</option>
                                    {chiGroups.map(c => <option key={c} value={c}>Chi {c}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                <select
                                    className="bg-background/50 border-white/10 rounded-xl px-3 py-2 text-sm font-bold focus:ring-primary-500/50 outline-none"
                                    value={selectedGen}
                                    onChange={e => setSelectedGen(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                >
                                    <option value="all">Tất cả Đời</option>
                                    {generations.map(g => <option key={g} value={g}>Đời {g}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Members Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-[280px] rounded-[2rem] bg-card/20 animate-pulse border border-white/5" />
                    ))
                ) : filteredMembers.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <Contact className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-xl font-bold text-muted-foreground">Không tìm thấy thành viên nào</p>
                        <Button variant="link" onClick={() => { setSearch(''); setSelectedChi('all'); setSelectedGen('all'); }}>Xóa bộ lọc</Button>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredMembers.map((m, idx) => (
                            <motion.div
                                key={m.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group"
                            >
                                <Card
                                    className="h-full bg-card/50 backdrop-blur-xl border-white/10 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative"
                                    onClick={() => router.push(`/directory/${m.id}`)}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <CardContent className="p-6 flex flex-col items-center text-center">
                                        {/* Avatar */}
                                        <div className="relative mb-4">
                                            <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center border border-primary-500/20 group-hover:scale-110 transition-transform duration-500 overflow-hidden shadow-xl shadow-primary-500/5">
                                                {m.avatar_url ? (
                                                    <Image src={m.avatar_url} alt={m.display_name} width={96} height={96} className="h-full w-full object-cover" />
                                                ) : (
                                                    <User className="h-10 w-10 text-primary-500" />
                                                )}
                                            </div>
                                            {m.status === 'active' && (
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 p-1.5 rounded-2xl border-[3px] border-background">
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-1 mb-4 w-full">
                                            <h3 className="font-black text-lg tracking-tight truncate px-2 group-hover:text-primary-500 transition-colors">
                                                {m.display_name}
                                            </h3>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                <Badge variant="outline" className="bg-primary-500/5 border-primary-500/20 text-primary-500 font-black text-[9px] tracking-widest uppercase">
                                                    Đời {m.generation}
                                                </Badge>
                                                <Badge variant="outline" className="bg-amber-500/5 border-amber-500/20 text-amber-500 font-black text-[9px] tracking-widest uppercase text-nowrap">
                                                    Chi {m.chi}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="w-full space-y-2 text-xs font-bold text-muted-foreground mb-6">
                                            <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-xl border border-border/30">
                                                <Briefcase className="h-3 w-3 shrink-0 text-primary-500/50" />
                                                <span className="truncate">{m.occupation}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-xl border border-border/30">
                                                <MapPin className="h-3 w-3 shrink-0 text-primary-500/50" />
                                                <span className="truncate">{m.current_address}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-auto w-full grid grid-cols-2 gap-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-2xl h-10 hover:bg-primary-500/10 text-primary-500"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    if (m.phone) window.location.href = `tel:${m.phone}`;
                                                }}
                                            >
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-2xl h-10 hover:bg-primary-500/10 text-primary-500"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    if (m.email) window.location.href = `mailto:${m.email}`;
                                                }}
                                            >
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>

                                    {/* Premium Admin Badge */}
                                    {m.role === 'admin' && (
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-primary-500/10 backdrop-blur-md border border-primary-500/30 p-1.5 rounded-xl" title="Quản trị viên">
                                                <ShieldCheck className="w-3.5 h-3.5 text-primary-500" />
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
