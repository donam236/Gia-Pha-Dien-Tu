'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    Shield,
    MapPin,
    Briefcase,
    Phone,
    Github,
    Facebook,
    Sparkles,
    CheckCircle2,
    ShieldCheck,
    MessageSquare,
    GitBranch
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

// === Types (Shared with Main Page) ===

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
    created_at?: string;
}

// === Mock Data (Shared with Main Page) ===

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
        status: 'active',
        created_at: '2025-10-01T08:00:00Z'
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
        status: 'active',
        created_at: '2025-11-15T09:30:00Z'
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
        status: 'active',
        created_at: '2025-12-05T14:20:00Z'
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
        status: 'active',
        created_at: '2026-01-10T11:45:00Z'
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
        status: 'active',
        created_at: '2026-02-01T16:10:00Z'
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
        status: 'active',
        created_at: '2026-02-20T10:00:00Z'
    }
];

export default function MemberDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [member, setMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMember = useCallback(async () => {
        if (!params.id) return;
        setLoading(true);

        // Check mock data first
        const mockMember = MOCK_MEMBERS.find(m => m.id === params.id);
        if (mockMember) {
            setMember(mockMember);
            setLoading(false);
            return;
        }

        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', params.id)
                .single();

            if (data) {
                setMember({
                    ...data,
                    generation: data.generation || 1,
                    chi: data.chi || 1,
                    occupation: data.occupation || 'Thành viên dòng họ',
                    current_address: data.current_address || 'Việt Nam',
                    is_living: true,
                    status: 'active'
                });
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [params.id]);

    useEffect(() => { fetchMember(); }, [fetchMember]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-xs font-black tracking-[0.3em] uppercase text-muted-foreground animate-pulse">Đang tải hồ sơ...</p>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
                <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-black">Hồ sơ này không tồn tại</h1>
                <Button variant="outline" className="rounded-2xl" onClick={() => router.push('/directory')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh bạ
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
            >
                <Button
                    variant="ghost"
                    className="rounded-xl hover:bg-primary-500/5 text-muted-foreground hover:text-primary-500 font-bold"
                    onClick={() => router.push('/directory')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại Danh bạ
                </Button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-4"
                >
                    <Card className="bg-card/50 backdrop-blur-xl border-white/10 rounded-[3rem] overflow-hidden sticky top-24 shadow-2xl">
                        <div className="h-32 bg-gradient-to-br from-primary-500 to-primary-700 relative">
                            <Sparkles className="absolute top-4 right-4 text-white/20 w-8 h-8" />
                        </div>
                        <CardContent className="flex flex-col items-center -mt-16 pb-10">
                            <div className="relative mb-6">
                                <div className="h-32 w-32 rounded-[2.5rem] bg-background p-1.5 border-4 border-card shadow-2xl">
                                    <div className="h-full w-full rounded-[2rem] bg-primary-500/10 flex items-center justify-center overflow-hidden">
                                        {member.avatar_url ? (
                                            <Image src={member.avatar_url} alt={member.display_name} width={128} height={128} className="object-cover h-full w-full" />
                                        ) : (
                                            <User className="h-14 w-14 text-primary-500" />
                                        )}
                                    </div>
                                </div>
                                {member.status === 'active' && (
                                    <div className="absolute bottom-2 right-2 bg-green-500 p-2 rounded-full border-4 border-card shadow-lg" title="Đang hoạt động">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>

                            <CardTitle className="text-2xl font-black text-center mb-2 px-4 leading-tight">
                                {member.display_name}
                            </CardTitle>

                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                <Badge variant="outline" className="bg-primary-500/10 border-primary-500/30 text-primary-500 font-black tracking-widest uppercase py-1">Đời {member.generation}</Badge>
                                <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-500 font-black tracking-widest uppercase py-1">Chi {member.chi}</Badge>
                            </div>

                            {/* Main Info */}
                            <div className="w-full space-y-2 px-4 mb-8">
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/30">
                                    <Briefcase className="h-4 w-4 text-primary-500" />
                                    <span className="text-sm font-bold text-muted-foreground truncate">{member.occupation}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/30">
                                    <MapPin className="h-4 w-4 text-primary-500" />
                                    <span className="text-sm font-bold text-muted-foreground truncate">{member.current_address}</span>
                                </div>
                            </div>

                            {/* Contact Links */}
                            <div className="w-full px-4 space-y-3">
                                <Button className="w-full h-12 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black tracking-wider shadow-lg shadow-primary-500/20">
                                    <MessageSquare className="mr-2 h-4 w-4" /> GỬI TIN NHẮN
                                </Button>
                                <div className="grid grid-cols-4 gap-2">
                                    {[Phone, Mail, Facebook, Github].map((Icon, i) => (
                                        <Button key={i} variant="outline" size="icon" className="h-12 w-full rounded-2xl border-white/10 bg-muted/20 hover:text-primary-500 hover:border-primary-500/50">
                                            <Icon className="h-4 w-4" />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Details Container */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Role & Status Info Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 rounded-[3rem] bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl border border-white/10 shadow-xl"
                    >
                        <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-primary-500">
                                    <ShieldCheck className="h-5 w-5" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Quyền hạn & Xác thực</span>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-70 tracking-tighter">Phân quyền</p>
                                        <div className="flex items-center gap-2">
                                            <Badge className={cn(
                                                "font-black tracking-widest",
                                                member.role === 'admin' ? "bg-rose-500 text-white" : "bg-primary-500 text-white"
                                            )}>
                                                {member.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-1 border-l border-white/10 pl-4">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-70 tracking-tighter">Trạng thái hồ sơ</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-sm font-black text-foreground">Đã xác thực danh tính</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 border-l border-white/10 pl-4">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase opacity-70 tracking-tighter">Ngày gia nhập</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-black text-foreground">
                                                {member.created_at ? new Date(member.created_at).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : '01/2026'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="rounded-2xl border-white/10 font-bold h-12 shadow-inner">
                                <Shield className="mr-2 h-4 w-4" /> Báo cáo vi phạm
                            </Button>
                        </div>
                    </motion.div>

                    {/* About Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-[3rem] bg-card/50 backdrop-blur-xl border border-white/10 shadow-xl"
                    >
                        <h2 className="text-xl font-black mb-6">Tiểu sử & Giới thiệu</h2>
                        <div className="space-y-4 text-muted-foreground font-medium leading-relaxed italic">
                            <p>
                                &quot;Sinh ra và lớn lên tại mảnh đất địa linh nhân kiệt, tôi luôn tự hào là người con của dòng họ Đỗ Quý.
                                Hiện đang công tác trong lĩnh vực {member.occupation}, tôi mong muốn đóng góp kiến thức và sức lực của mình
                                để xây dựng dòng họ ngày càng vững mạnh.&quot;
                            </p>
                        </div>
                    </motion.div>

                    {/* Recent Activity Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-8 rounded-[3rem] bg-card/50 backdrop-blur-xl border border-white/10 shadow-xl"
                    >
                        <h2 className="text-xl font-black mb-6">Hoạt động gần đây</h2>
                        <div className="space-y-6">
                            {[
                                { action: 'Đã cập nhật thông tin Chi', date: '2 ngày trước', icon: GitBranch },
                                { action: 'Đã đóng góp tư liệu "Ảnh gia phả xưa"', date: '1 tuần trước', icon: Sparkles }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                                        <item.icon className="h-4 w-4 text-primary-500" />
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-sm font-bold text-foreground group-hover:text-primary-500 transition-colors">{item.action}</p>
                                        <p className="text-xs text-muted-foreground font-medium">{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// === Utility (Local fallback if cn is not imported) ===
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
