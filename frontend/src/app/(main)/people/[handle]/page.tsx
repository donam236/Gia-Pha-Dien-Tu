'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, User, Heart, ImageIcon, FileText, History, Phone,
    MapPin, Briefcase, GraduationCap, Tag, MessageCircle,
    Calendar, Baby, Skull, Home, Info, Shield, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { zodiacYear } from '@/lib/genealogy-types';
import type { PersonDetail } from '@/lib/genealogy-types';
import { CommentSection } from '@/components/comment-section';
import { fetchPersonByHandle } from '@/lib/supabase-data';
import { ContributeDialog } from '@/components/contribute-dialog';
import { Edit3 } from 'lucide-react';

export default function PersonProfilePage() {
    const params = useParams();
    const router = useRouter();
    const handle = params.handle as string;
    const [person, setPerson] = useState<PersonDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isContributeOpen, setIsContributeOpen] = useState(false);

    useEffect(() => {
        const loadPerson = async () => {
            setLoading(true);
            try {
                const data = await fetchPersonByHandle(handle);
                if (data) {
                    setPerson(data as PersonDetail);
                }
            } catch (err) {
                console.error('Error loading person:', err);
            } finally {
                setLoading(false);
            }
        };
        loadPerson();
    }, [handle]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin" />
                </div>
                <p className="text-muted-foreground animate-pulse font-medium">Đang tải hồ sơ...</p>
            </div>
        );
    }

    if (!person) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50"
            >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold">Không tìm thấy thành viên</h2>
                <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Thành viên này không tồn tại hoặc bạn không có quyền truy cập.</p>
                <Button variant="outline" className="mt-6 rounded-full px-8" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách
                </Button>
            </motion.div>
        );
    }

    const isMale = (person.gender || 'male') === 'male';
    const headerGradient = isMale
        ? "from-blue-600/20 via-primary-500/10 to-transparent"
        : "from-rose-500/20 via-primary-500/10 to-transparent";
    const generationColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';

    return (
        <div className="relative min-h-[calc(100vh-120px)]">
            <ContributeDialog
                person={person}
                isOpen={isContributeOpen}
                onClose={() => setIsContributeOpen(false)}
            />

            {/* Ambient Background Elements - Create Depth */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -m-8 lg:-m-12">
                <div className={`absolute top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 animate-pulse-slow ${isMale ? 'bg-blue-500/30' : 'bg-pink-500/30'}`} />
                <div className="absolute bottom-[20%] -right-[5%] w-[35%] h-[35%] rounded-full blur-[100px] opacity-10 animate-pulse bg-emerald-500/20" />
                <div className="absolute top-[40%] left-[40%] w-[25%] h-[25%] rounded-full blur-[80px] opacity-10 bg-accent-400/20" />
            </div>

            <div className="relative max-w-6xl mx-auto pb-12 space-y-8 animate-fade-in">
                {/* Action Bar */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        className="group rounded-xl pl-2 pr-4 text-surface-500 hover:text-surface-900 dark:hover:text-white transition-all bg-white/5 dark:bg-white/5 border border-transparent hover:border-white/10"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Quay lại
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="rounded-xl glass-card border-white/10 hover:border-primary/50 transition-colors gap-2 px-4"
                            onClick={() => setIsContributeOpen(true)}
                        >
                            <Edit3 className="h-4 w-4 text-primary-500" />
                            <span className="text-xs font-bold">Đề xuất sửa</span>
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-xl glass-card border-white/10 hover:border-primary/50 transition-colors">
                            <Users className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-xl glass-card border-white/10 hover:border-primary/50 transition-colors">
                            <History className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Profile Header Card - Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity rounded-[2.5rem]" />

                    <Card className="glass-card rounded-[2.5rem] border-white/10 dark:border-white/10 shadow-2xl overflow-hidden relative border-glow">
                        <div className={`absolute inset-0 bg-gradient-to-br ${headerGradient}`} />

                        <CardContent className="p-8 md:p-12 relative z-10">
                            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                                {/* Enhanced Avatar */}
                                <div className="relative">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className={`w-36 h-36 md:w-48 md:h-48 rounded-full bg-gradient-to-br ${isMale ? 'from-blue-400 to-blue-600 shadow-blue-500/20' : 'from-pink-400 to-pink-600 shadow-pink-500/20'} p-1.5 shadow-2xl relative z-10`}
                                    >
                                        <div className="w-full h-full rounded-full bg-surface-950 flex items-center justify-center overflow-hidden border-4 border-white/10">
                                            <User className="w-24 h-24 text-white/10" />
                                        </div>
                                    </motion.div>
                                    {/* Ornamental Ring */}
                                    <div className={`absolute inset-0 rounded-full border-2 border-dashed ${isMale ? 'border-blue-500/30' : 'border-pink-500/30'} animate-[spin_20s_linear_infinite] -m-4`} />

                                    <div className={`absolute bottom-6 -right-2 p-2.5 rounded-2xl shadow-xl border border-white/20 backdrop-blur-xl ${isMale ? 'bg-blue-500' : 'bg-pink-500'} z-20`}>
                                        {isMale ? <Users className="h-6 w-6 text-white" /> : <Heart className="h-6 w-6 text-white" />}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6 self-center">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-surface-900 dark:text-white leading-none">
                                                <span className="bg-gradient-to-r from-surface-900 to-surface-500 dark:from-white dark:to-surface-400 bg-clip-text text-transparent">
                                                    {person.displayName}
                                                </span>
                                            </h1>
                                            <Badge className={`rounded-full px-5 py-1.5 text-xs font-black uppercase tracking-widest shadow-lg ${generationColor} border-0`}>
                                                Đời thứ {person.generation}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                            <span className={`${isMale ? 'bg-blue-500/10 text-blue-500' : 'bg-pink-500/10 text-pink-500'} px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border border-current/10`}>
                                                {isMale ? 'NAM TỬ' : 'NỮ TỬ'}
                                            </span>
                                            <Separator orientation="vertical" className="h-4 opacity-10 bg-white" />
                                            {person.isLiving ? (
                                                <span className="text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border border-emerald-500/10">TRƯƠNG TẠI</span>
                                            ) : (
                                                <span className="text-surface-400 bg-surface-400/10 px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border border-surface-400/10">QUÁ VÃNG</span>
                                            )}
                                        </div>
                                    </div>

                                    {person.occupation && (
                                        <div className="relative py-2">
                                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary-500/40 rounded-full" />
                                            <p className="text-xl text-surface-600 dark:text-surface-300 max-w-2xl font-semibold leading-relaxed">
                                                {person.occupation}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                                        {person.tags?.map(tag => (
                                            <Badge key={tag} variant="outline" className="bg-white/5 hover:bg-white/10 dark:text-surface-300 border-white/5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all hover:border-primary-500/30">
                                                <Tag className="h-3 w-3 mr-2 text-primary-500 opacity-60" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar Info: 4 columns */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Timeline Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="glass-card rounded-3xl border-white/5 shadow-xl overflow-hidden group">
                                <div className="p-6 pb-2">
                                    <h3 className="text-sm font-black text-primary-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        Niên biểu gia tộc
                                    </h3>

                                    <div className="space-y-8 relative">
                                        {/* Vertical line connecting events */}
                                        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-500/20 via-surface-200/10 to-rose-500/20 pointer-events-none" />

                                        {/* Birth Event */}
                                        <div className="flex gap-6 items-start relative">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 group-hover:scale-110 transition-transform z-10">
                                                <Baby className="h-6 w-6 text-emerald-500" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">NGÀY SINH</p>
                                                <p className="text-xl font-black text-surface-900 dark:text-white leading-tight">
                                                    {person.birthDate || person.birthYear || 'Chưa rõ'}
                                                </p>
                                                {person.birthYear && (
                                                    <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-3">
                                                        Năm {zodiacYear(person.birthYear)}
                                                    </Badge>
                                                )}
                                                <p className="text-sm text-surface-500 mt-2 font-medium flex items-start gap-2">
                                                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                                    {person.birthPlace || 'Địa danh chưa rõ'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Death Event */}
                                        {!person.isLiving && (
                                            <div className="flex gap-6 items-start relative">
                                                <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center shrink-0 border border-surface-200 dark:border-white/5 shadow-lg group-hover:scale-110 transition-transform z-10">
                                                    <Skull className="h-6 w-6 text-surface-400" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">NGÀY MẤT</p>
                                                    <p className="text-xl font-black text-surface-900 dark:text-white leading-tight opacity-70">
                                                        {person.deathDate || person.deathYear || 'Chưa rõ'}
                                                    </p>
                                                    <p className="text-sm text-surface-500 mt-2 font-medium flex items-start gap-2">
                                                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                                        {person.deathPlace || 'Địa danh chưa rõ'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-8 bg-gradient-to-r from-emerald-600/10 to-transparent p-4 flex items-center justify-between text-[10px] font-black tracking-widest text-surface-500 uppercase">
                                    <span>Lưu trữ vĩnh viễn</span>
                                    <Shield className="h-3 w-3 opacity-30" />
                                </div>
                            </Card>
                        </motion.div>

                        {/* Contact Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass-card rounded-3xl border-white/5 shadow-xl overflow-hidden p-6">
                                <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 mb-8">
                                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <MessageCircle className="h-4 w-4" />
                                    </div>
                                    Thông tin kết nối
                                </h3>

                                <div className="space-y-6">
                                    <ContactItem
                                        icon={<Phone className="h-5 w-5" />}
                                        label="Số điện thoại"
                                        value={person.phone}
                                        color="blue"
                                    />
                                    <ContactItem
                                        icon={<Home className="h-5 w-5" />}
                                        label="Địa chỉ Email"
                                        value={person.email}
                                        color="blue"
                                    />
                                    <ContactItem
                                        icon={<MapPin className="h-5 w-5" />}
                                        label="Nơi ở hiện tại"
                                        value={person.currentAddress}
                                        color="blue"
                                        multiline
                                    />
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right Detailed Area: 8 columns */}
                    <div className="lg:col-span-8 space-y-6">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/10 p-1.5 rounded-[1.5rem] w-full justify-between h-auto mb-8 shadow-xl">
                                <TabTrigger value="overview" icon={<Info className="h-4 w-4" />} label="TỔNG QUAN" />
                                <TabTrigger value="relationships" icon={<Users className="h-4 w-4" />} label="QUAN HỆ" />
                                <TabTrigger value="biography" icon={<FileText className="h-4 w-4" />} label="TIỂU SỬ" />
                                <TabTrigger value="media" icon={<ImageIcon className="h-4 w-4" />} label="HÌNH ẢNH" />
                                <TabTrigger value="comments" icon={<MessageCircle className="h-4 w-4" />} label="BÌNH LUẬN" />
                            </TabsList>

                            <AnimatePresence mode="wait">
                                <TabsContent value="overview" className="mt-0 space-y-8 animate-slide-up">
                                    <div className="grid gap-8 md:grid-cols-2">
                                        <Card className="glass-card rounded-3xl border-white/5 shadow-lg p-8 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-colors" />
                                            <h4 className="text-xs font-black text-surface-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <User className="h-4 w-4 text-emerald-500" /> Bản sắc thành viên
                                            </h4>
                                            <div className="grid grid-cols-2 gap-6">
                                                <DetailBox label="HỌ TỘC" value={person.surname} />
                                                <DetailBox label="TÊN GỌI" value={person.firstName} />
                                                <DetailBox label="DANH XƯNG" value={person.nickName} />
                                                <DetailBox label="HỆ PHÁI" value={isMale ? 'Nam Tộc' : 'Nữ Tộc'} />
                                            </div>
                                        </Card>

                                        <Card className="glass-card rounded-3xl border-white/5 shadow-lg p-8 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
                                            <h4 className="text-xs font-black text-surface-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-blue-500" /> Sự nghiệp & Thành tựu
                                            </h4>
                                            <div className="space-y-6">
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10">
                                                        <Briefcase className="h-5 w-5 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">CÔNG VIỆC</p>
                                                        <p className="text-base font-bold text-surface-900 dark:text-white">{person.occupation || 'Chưa cập nhật'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/10">
                                                        <GraduationCap className="h-5 w-5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">HỌC VỊ</p>
                                                        <p className="text-base font-bold text-surface-900 dark:text-white">{person.education || 'Chưa cập nhật'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    {person.notes && (
                                        <Card className="glass-card rounded-3xl border-white/5 shadow-lg p-8 relative border-glow overflow-hidden">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-accent-500/10 flex items-center justify-center shrink-0 text-accent-500">
                                                    <Info className="h-6 w-6" />
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-black text-accent-500 uppercase tracking-widest">Di huấn & Ghi chú</h4>
                                                    <p className="text-lg leading-relaxed text-surface-700 dark:text-surface-300 italic font-medium">
                                                        &ldquo;{person.notes}&rdquo;
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </TabsContent>

                                <TabsContent value="relationships" className="mt-0 space-y-8 animate-slide-up">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <RelationshipCard
                                            title="BẬC SINH THÀNH"
                                            icon={<Users className="text-emerald-500" />}
                                            items={person.parentFamilies}
                                        />
                                        <RelationshipCard
                                            title="PHỐI NGẪU & HẬU DUỆ"
                                            icon={<Heart className="text-rose-500" />}
                                            items={person.families}
                                        />
                                    </div>
                                    <Card className="p-6 bg-accent-500/5 border border-accent-500/10 rounded-3xl flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-2xl bg-accent-500/10 flex items-center justify-center text-accent-500 shrink-0">
                                            <Shield className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-accent-600 dark:text-accent-400 mb-0.5">Quy định bảo mật thông tin</p>
                                            <p className="text-xs text-surface-500 leading-relaxed font-medium">
                                                Mối liên hệ huyết thống được xác lập dựa trên cơ sở dữ liệu quốc gia về phả hệ. Các nút gia đình chứa mã định danh bảo mật.
                                            </p>
                                        </div>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="biography" className="mt-0">
                                    <Card className="glass-card rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden min-h-[400px]">
                                        <div className="bg-gradient-to-r from-primary-500/10 via-accent-500/5 to-transparent p-10 border-b border-white/5 relative">
                                            <FileText className="h-10 w-10 text-primary-500 mb-4 opacity-50" />
                                            <h3 className="text-3xl font-black text-surface-900 dark:text-white uppercase tracking-tighter">HÀNH TRẠNG TIỂU SỬ</h3>
                                            <div className="w-20 h-1 bg-primary-500 rounded-full mt-4" />
                                        </div>
                                        <CardContent className="p-10 md:p-14">
                                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                                {person.biography ? (
                                                    <p className="text-lg md:text-xl leading-[1.8] text-surface-700 dark:text-surface-200 font-medium whitespace-pre-line first-letter:text-6xl first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:text-primary-500 transition-all">
                                                        {person.biography}
                                                    </p>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-20 opacity-20 gap-6 text-center">
                                                        <FileText className="h-24 w-24" />
                                                        <p className="text-xl font-bold tracking-widest uppercase">Chờ cập nhật tiểu sử</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="media" className="mt-0">
                                    <Card className="glass-card rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden">
                                        <CardContent className="flex flex-col items-center justify-center py-32 text-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-50" />
                                            <div className="relative mb-8">
                                                <div className="absolute inset-x-0 bottom-0 h-8 bg-blue-500/40 blur-3xl" />
                                                <ImageIcon className="h-24 w-24 text-primary-500/40 relative animate-pulse-slow" />
                                            </div>
                                            <h3 className="text-3xl font-black text-surface-900 dark:text-white mb-4 tracking-tighter">KHO TƯ LIỆU GIA TỘC</h3>
                                            <p className="text-surface-500 max-w-sm mb-10 text-lg font-medium leading-relaxed">
                                                Nơi lưu giữ những khoảnh khắc vàng của thành viên và dòng họ qua các thế hệ.
                                            </p>
                                            <Badge variant="outline" className="px-8 py-3 bg-primary-500/10 text-primary-500 border-primary-500/30 uppercase font-black text-xs tracking-[0.2em]">
                                                Tính năng đang hoàn thiện
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="comments" className="mt-0">
                                    <Card className="glass-card rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden">
                                        <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                                            <CardTitle className="text-2xl font-black text-surface-900 dark:text-white flex items-center gap-4">
                                                <div className="p-3 rounded-2xl bg-primary-500/10">
                                                    <MessageCircle className="h-7 w-7 text-primary-500" />
                                                </div>
                                                Sổ Tang & Tri Ân
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8">
                                            <CommentSection personHandle={handle} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </AnimatePresence>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══ Helper Components for Consistent UI ═══

function TabTrigger({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
    return (
        <TabsTrigger
            value={value}
            className="group relative px-2 py-4 flex-1 data-[state=active]:bg-primary-500 data-[state=active]:text-white rounded-[1.2rem] transition-all duration-500 overflow-hidden"
        >
            <div className="relative z-10 flex items-center justify-center gap-2">
                <span className="opacity-70 group-data-[state=active]:opacity-100 transition-opacity">{icon}</span>
                <span className="text-[10px] md:text-xs font-black tracking-[0.15em] hidden sm:block">{label}</span>
            </div>
            {/* Active Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-data-[state=active]:opacity-100 transition-opacity" />
        </TabsTrigger>
    );
}

function ContactItem({ icon, label, value, color, multiline }: { icon: React.ReactNode; label: string; value?: string; color: string; multiline?: boolean }) {
    if (!value) return null;
    return (
        <div className="flex gap-5 items-center group">
            <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center shrink-0 border border-${color}-500/10 shadow-lg group-hover:scale-110 transition-transform`}>
                <span className={`text-${color}-500`}>{icon}</span>
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-surface-900 dark:text-white font-bold leading-tight ${multiline ? 'text-sm' : 'truncate'}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function DetailBox({ label, value }: { label: string; value?: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">{label}</p>
            <p className="text-base font-bold text-surface-900 dark:text-white">{value || '—'}</p>
        </div>
    );
}

function RelationshipCard({ title, icon, items }: { title: string; icon: React.ReactNode; items?: string[] }) {
    return (
        <Card className="glass-card rounded-3xl border-white/5 shadow-lg p-8 group">
            <h4 className="text-xs font-black text-surface-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-surface-100 dark:bg-white/5 flex items-center justify-center">{icon}</span>
                {title}
            </h4>
            <div className="grid gap-3">
                {items && items.length > 0 ? (
                    items.map(f => (
                        <div key={f} className="group/item flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-primary-500/10 border border-white/5 hover:border-primary-500/20 transition-all cursor-pointer">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-1">MÃ GIA ĐÌNH</span>
                                <span className="text-base font-black text-surface-900 dark:text-white">{f}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <ArrowLeft className="h-4 w-4 rotate-180 text-primary-500" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-6 text-center border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-xs text-surface-500 font-bold uppercase tracking-widest italic leading-none">Chưa có dữ liệu</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
