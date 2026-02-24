'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Check, Upload, User, Smartphone, Mail, MapPin } from 'lucide-react';
import type { PersonDetail } from '@/lib/genealogy-types';
import { motion, AnimatePresence } from 'framer-motion';

interface ContributeDialogProps {
    person: PersonDetail;
    isOpen: boolean;
    onClose: () => void;
}

export function ContributeDialog({ person, isOpen, onClose }: ContributeDialogProps) {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        contributorName: '',
        contributorContact: '',
        displayName: person.displayName || '',
        birthYear: person.birthYear?.toString() || '',
        deathYear: person.deathYear?.toString() || '',
        isLiving: person.isLiving,
        occupation: person.occupation || '',
        education: person.education || '',
        phone: person.phone || '',
        email: person.email || '',
        currentAddress: person.currentAddress || '',
        biography: person.biography || '',
        notes: person.notes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Simulate API call to Supabase
            // In a real implementation, we would call a supabase function or use the supabase client
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSubmitted(true);
        } catch (err) {
            console.error('Failed to submit contribution:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const resetAndClose = () => {
        setSubmitted(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card/90 dark:bg-slate-950/90 backdrop-blur-2xl border-border/50 dark:border-white/10 rounded-[2rem] shadow-2xl transition-colors duration-500">
                <AnimatePresence mode="wait">
                    {!submitted ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="flex flex-col h-[80vh] max-h-[700px]"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-border/50 dark:border-white/5 bg-gradient-to-r from-primary-500/10 to-transparent">
                                <DialogHeader>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                                            <User className="w-6 h-6 text-primary-500" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-2xl font-black text-foreground tracking-tight">Đề xuất chỉnh sửa</DialogTitle>
                                            <DialogDescription className="text-muted-foreground font-medium">
                                                Cập nhật thông tin cho ông/bà: <span className="text-primary-500 font-extrabold">{person.displayName}</span>
                                            </DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>
                            </div>

                            {/* Form Content */}
                            <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                                <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/10 p-1 mb-8 rounded-2xl">
                                        <TabsTrigger value="basic" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary-500 data-[state=active]:text-white font-bold text-xs transition-all">CƠ BẢN</TabsTrigger>
                                        <TabsTrigger value="contact" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary-500 data-[state=active]:text-white font-bold text-xs transition-all">LIÊN HỆ</TabsTrigger>
                                        <TabsTrigger value="bio" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary-500 data-[state=active]:text-white font-bold text-xs transition-all">TIỂU SỬ</TabsTrigger>
                                        <TabsTrigger value="evidence" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary-500 data-[state=active]:text-white font-bold text-xs transition-all">MINH CHỨNG</TabsTrigger>
                                    </TabsList>

                                    {/* Basic Info Tab */}
                                    <TabsContent value="basic" className="space-y-6 mt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Họ và Tên</Label>
                                                <Input
                                                    name="displayName"
                                                    value={formData.displayName}
                                                    onChange={handleChange}
                                                    className="bg-background/50 dark:bg-white/5 border-border/50 dark:border-white/10 rounded-xl h-12 font-bold focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
                                                    placeholder="Nhập họ và tên chính xác"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Năm sinh</Label>
                                                    <Input
                                                        name="birthYear"
                                                        value={formData.birthYear}
                                                        onChange={handleChange}
                                                        className="bg-background/50 dark:bg-white/5 border-border/50 dark:border-white/10 rounded-xl h-12 font-bold focus:border-primary-500/50"
                                                        placeholder="TT"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Năm mất</Label>
                                                    <Input
                                                        name="deathYear"
                                                        value={formData.deathYear}
                                                        onChange={handleChange}
                                                        disabled={formData.isLiving}
                                                        className="bg-background/50 dark:bg-white/5 border-border/50 dark:border-white/10 rounded-xl h-12 font-bold focus:border-primary-500/50"
                                                        placeholder="TT"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nghề nghiệp</Label>
                                                <Input
                                                    name="occupation"
                                                    value={formData.occupation}
                                                    onChange={handleChange}
                                                    className="bg-background/50 dark:bg-white/5 border-border/50 dark:border-white/10 rounded-xl h-12 font-bold focus:border-primary-500/50"
                                                    placeholder="VD: Nhà giáo, Kỹ sư..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Học vị</Label>
                                                <Input
                                                    name="education"
                                                    value={formData.education}
                                                    onChange={handleChange}
                                                    className="bg-background/50 dark:bg-white/5 border-border/50 dark:border-white/10 rounded-xl h-12 font-bold focus:border-primary-500/50"
                                                    placeholder="VD: Cử nhân, Tiến sĩ..."
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Contact Tab */}
                                    <TabsContent value="contact" className="space-y-6 mt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Số điện thoại</Label>
                                                <div className="relative">
                                                    <Smartphone className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/60" />
                                                    <Input
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className="bg-background/50 dark:bg-white/5 border-border/50 dark:border-white/10 rounded-xl h-12 pl-12 font-bold focus:border-primary-500/50"
                                                        placeholder="09xx xxx xxx"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/60" />
                                                    <Input
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className="bg-background/50 dark:bg-white/5 border-border/50 dark:border-white/10 rounded-xl h-12 pl-12 font-bold focus:border-primary-500/50"
                                                        placeholder="example@gmail.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Địa chỉ hiện tại</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/60" />
                                                    <Input
                                                        name="currentAddress"
                                                        value={formData.currentAddress}
                                                        onChange={handleChange}
                                                        className="bg-background/50 dark:bg-white/5 border-border/50 dark:border-white/10 rounded-xl h-12 pl-12 font-bold focus:border-primary-500/50"
                                                        placeholder="Số nhà, đường, phường/xã..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Biography Tab */}
                                    <TabsContent value="bio" className="space-y-6 mt-0">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tiểu sử chi tiết / Hành trạng</Label>
                                            <Textarea
                                                name="biography"
                                                value={formData.biography}
                                                onChange={handleChange}
                                                className="bg-background/50 dark:bg-white/5 border-border/50 dark:border-white/10 rounded-2xl min-h-[200px] p-4 font-medium focus:border-primary-500/50 leading-relaxed"
                                                placeholder="Viết về cuộc đời, sự nghiệp và những đóng góp của thành viên..."
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* Evidence Tab */}
                                    <TabsContent value="evidence" className="space-y-6 mt-0">
                                        <div className="border-2 border-dashed border-border/50 dark:border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center gap-4 hover:border-primary-500/30 transition-all bg-muted/30 dark:bg-white/5 group/upload">
                                            <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center group-hover/upload:scale-110 transition-transform">
                                                <Upload className="w-8 h-8 text-primary-500" />
                                            </div>
                                            <div>
                                                <p className="text-foreground font-extrabold text-lg">Tải lên ảnh minh chứng</p>
                                                <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1 font-medium">
                                                    Ảnh bia mộ, bằng khen, hoặc ảnh gốc của thành viên để Ban quản trị đối chiếu.
                                                </p>
                                            </div>
                                            <Button variant="outline" className="rounded-xl px-8 border-border/50 hover:bg-white/5 mt-2 font-bold">
                                                Chọn tệp tin
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Contributor Info Footer */}
                            <div className="p-8 border-t border-border/50 dark:border-white/5 bg-muted/30 dark:bg-slate-900/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary-500 ml-1">Họ tên của bạn *</Label>
                                        <Input
                                            name="contributorName"
                                            required
                                            value={formData.contributorName}
                                            onChange={handleChange}
                                            className="bg-background dark:bg-slate-950/50 border-primary-500/20 rounded-xl h-11 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                            placeholder="Để chúng tôi biết ai đã đóng góp"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary-500 ml-1">SĐT / Zalo liên hệ *</Label>
                                        <Input
                                            name="contributorContact"
                                            required
                                            value={formData.contributorContact}
                                            onChange={handleChange}
                                            className="bg-background dark:bg-slate-950/50 border-primary-500/20 rounded-xl h-11 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                                            placeholder="Để Admin trao đổi khi cần"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-muted-foreground hover:bg-primary-500/5"
                                        onClick={onClose}
                                    >
                                        HỦY BỎ
                                    </Button>
                                    <Button
                                        className="flex-[2] rounded-2xl h-14 font-black uppercase tracking-widest bg-gradient-to-r from-primary-500 to-primary-600 shadow-xl shadow-primary-500/20 hover:scale-[1.02] transition-all hover:shadow-primary-500/40 text-white"
                                        onClick={handleSubmit}
                                        disabled={submitting || !formData.contributorName || !formData.contributorContact}
                                    >
                                        {submitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ĐANG GỬI...
                                            </div>
                                        ) : 'GỬI ĐỀ XUẤT ĐÓNG GÓP'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center p-12 py-24 text-center space-y-8"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/40 blur-3xl rounded-full" />
                                <div className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center relative shadow-2xl">
                                    <Check className="w-12 h-12" strokeWidth={3} />
                                </div>
                            </div>

                            <div className="space-y-4 max-w-sm">
                                <h2 className="text-3xl font-black text-foreground tracking-tight">Gửi thành công!</h2>
                                <p className="text-muted-foreground font-medium leading-relaxed">
                                    Cảm ơn sự đóng góp quý báu của bạn đối với dữ liệu dòng họ Đỗ Quý. Trưởng tộc sẽ kiểm duyệt và cập nhật trong thời gian sớm nhất.
                                </p>
                            </div>

                            <Button
                                className="rounded-2xl h-14 px-12 font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 text-white"
                                onClick={resetAndClose}
                            >
                                ĐÃ HIỂU
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
