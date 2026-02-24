'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TreePine, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

const registerSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    displayName: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(100),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteCode = searchParams.get('code') || '';
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

    const onSubmit = async (data: RegisterForm) => {
        if (!inviteCode) {
            setError('Bạn cần có mã mời để đăng ký');
            return;
        }

        try {
            setError('');
            setLoading(true);

            // Validate invite code against Supabase
            const { data: invite, error: inviteErr } = await supabase
                .from('invite_links')
                .select('*')
                .eq('code', inviteCode)
                .single();

            if (inviteErr || !invite) {
                setError('Mã mời không hợp lệ hoặc đã hết hạn');
                return;
            }

            if (invite.max_uses && invite.used_count >= invite.max_uses) {
                setError('Mã mời đã hết lượt sử dụng');
                return;
            }

            // Sign up via Supabase Auth
            const { data: authData, error: authErr } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        display_name: data.displayName,
                        invite_code: inviteCode,
                    },
                },
            });

            if (authErr) {
                setError(authErr.message);
                return;
            }

            // Increment invite used_count
            await supabase
                .from('invite_links')
                .update({ used_count: (invite.used_count || 0) + 1 })
                .eq('id', invite.id);

            // Create profile
            if (authData.user) {
                await supabase.from('profiles').upsert({
                    id: authData.user.id,
                    email: data.email,
                    display_name: data.displayName,
                    role: invite.role || 'member',
                    status: 'active',
                });
            }

            router.push('/');
        } catch {
            setError('Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <Card className="bg-card/70 backdrop-blur-3xl border-white/20 shadow-2xl rounded-[3rem] overflow-hidden">
            <CardHeader className="text-center space-y-4 pt-10 px-8">
                <div className="flex justify-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                        className="rounded-[1.5rem] bg-primary-500/10 p-5 border border-primary-500/20"
                    >
                        <TreePine className="h-10 w-10 text-primary-500" />
                    </motion.div>
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-4xl font-black tracking-tighter italic text-nowrap">Gia Nhập Đỗ Quý</CardTitle>
                    <CardDescription className="text-muted-foreground font-medium italic">
                        Đăng ký tham gia nền tảng gia phả dòng họ Đỗ Quý
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="px-8 pb-10">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <AnimatePresence mode="wait">
                        {!inviteCode && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 text-xs font-bold text-amber-600 italic flex items-start gap-2"
                            >
                                <span className="text-lg">⚠️</span>
                                <span>Bạn cần có mã mời từ Người quản trị để có thể đăng ký tài khoản thành viên.</span>
                            </motion.div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="rounded-2xl bg-rose-500/10 p-4 border border-rose-500/20 text-sm text-rose-600 font-bold italic"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="displayName">Tên hiển thị</label>
                            <Input
                                id="displayName"
                                placeholder="Ví dụ: Đỗ Quý Nam"
                                className="bg-background/50 border-white/5 rounded-2xl h-12 px-5 font-bold focus-visible:ring-primary-500/30"
                                {...register('displayName')}
                            />
                            {errors.displayName && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.displayName.message}</p>}
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="email">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                className="bg-background/50 border-white/5 rounded-2xl h-12 px-5 font-bold focus-visible:ring-primary-500/30"
                                {...register('email')}
                            />
                            {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.email.message}</p>}
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4">
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="password">Mật khẩu</label>
                                <div className="relative group">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="bg-background/50 border-white/5 rounded-2xl h-12 px-5 font-bold focus-visible:ring-primary-500/30"
                                        {...register('password')}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-500"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.password.message}</p>}
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="confirmPassword">Nhập lại</label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-background/50 border-white/5 rounded-2xl h-12 px-5 font-bold focus-visible:ring-primary-500/30"
                                    {...register('confirmPassword')}
                                />
                                {errors.confirmPassword && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.confirmPassword.message}</p>}
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants} className="pt-2">
                            <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-2xl h-14 font-black shadow-xl shadow-primary-500/20 active:scale-95 transition-all" disabled={loading || !inviteCode}>
                                {loading ? 'ĐANG XỬ LÝ...' : <span className="uppercase tracking-widest">Xác nhận đăng ký</span>}
                            </Button>
                        </motion.div>

                        <motion.div variants={itemVariants} className="text-center pt-2">
                            <Button variant="link" className="text-xs font-bold text-muted-foreground hover:text-primary-500" onClick={() => router.push('/login')}>
                                Đã có tài khoản? Đăng nhập ngay
                            </Button>
                        </motion.div>
                    </motion.div>
                </form>
            </CardContent>
        </Card>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-48"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
            <RegisterContent />
        </Suspense>
    );
}
