'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TreePine, Eye, EyeOff, UserPlus, LogIn, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth-provider';

const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    displayName: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { signIn, signUp } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'register'>('login');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginForm) => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'register') {
                const result = await signUp(data.email, data.password, data.displayName);
                if (result.error) {
                    if (result.error.includes('Đã đăng ký') || result.error.includes('Kiểm tra email')) {
                        setSuccess(result.error);
                    } else {
                        setError(result.error);
                    }
                } else {
                    router.push('/tree');
                }
            } else {
                const result = await signIn(data.email, data.password);
                if (result.error) {
                    setError(result.error);
                } else {
                    router.push('/');
                }
            }
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
                        className="rounded-[1.5rem] bg-primary-500/10 p-5 border border-primary-500/20 relative group"
                    >
                        <TreePine className="h-10 w-10 text-primary-500 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute -top-1 -right-1 bg-amber-500 p-1.5 rounded-full border-2 border-background">
                            <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                    </motion.div>
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-4xl font-black tracking-tighter italic">Đỗ Quý Gia Tộc</CardTitle>
                    <CardDescription className="text-muted-foreground font-medium italic">
                        {mode === 'login'
                            ? 'Dành cho con cháu quản lý và đóng góp thông tin dòng họ'
                            : 'Đăng ký trở thành thành viên kỹ thuật số của dòng tộc'
                        }
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="px-8 pb-10">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="rounded-2xl bg-rose-500/10 p-4 border border-rose-500/20 text-sm text-rose-600 font-bold italic flex items-center gap-2"
                            >
                                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-sm text-emerald-600 font-bold italic flex items-center gap-2"
                            >
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
                                {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-5"
                    >
                        <AnimatePresence mode="popLayout">
                            {mode === 'register' && (
                                <motion.div
                                    key="displayName"
                                    variants={itemVariants}
                                    className="space-y-2"
                                >
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="displayName">Họ và tên</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary-500 transition-colors" />
                                        <Input
                                            id="displayName"
                                            placeholder="Ví dụ: Đỗ Quý Nam"
                                            className="bg-background/50 border-white/5 rounded-2xl h-12 pl-12 font-bold focus-visible:ring-primary-500/30"
                                            {...register('displayName')}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="email">Địa chỉ Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary-500 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    className="bg-background/50 border-white/5 rounded-2xl h-12 pl-12 font-bold focus-visible:ring-primary-500/30"
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.email.message}</p>}
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1" htmlFor="password">Mật khẩu</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary-500 transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="bg-background/50 border-white/5 rounded-2xl h-12 pl-12 pr-12 font-bold focus-visible:ring-primary-500/30"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-500 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.password.message}</p>}
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-2">
                            <Button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-2xl h-14 font-black shadow-xl shadow-primary-500/20 active:scale-95 transition-all" disabled={loading}>
                                {mode === 'login' ? (
                                    <>{loading ? 'ĐANG XỬ LÝ...' : <span className="flex items-center gap-2 uppercase tracking-widest"><LogIn className="h-5 w-5" /> Tiếp tục đăng nhập</span>}</>
                                ) : (
                                    <>{loading ? 'ĐANG KHỞI TẠO...' : <span className="flex items-center gap-2 uppercase tracking-widest"><UserPlus className="h-5 w-5" /> Tạo tài khoản mới</span>}</>
                                )}
                            </Button>
                        </motion.div>

                        <motion.div variants={itemVariants} className="relative flex items-center gap-4">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">hoặc</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-sm font-bold h-12 rounded-2xl border border-white/5 hover:bg-white/5 group"
                                onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
                            >
                                {mode === 'login'
                                    ? <span className="flex items-center justify-center gap-2 w-full">Chưa có tài khoản? <span className="text-primary-500 flex items-center">Tham gia ngay <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" /></span></span>
                                    : <span className="flex items-center justify-center gap-2 w-full">Đã là thành viên? <span className="text-primary-500 flex items-center">Quay lại đăng nhập <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" /></span></span>
                                }
                            </Button>
                        </motion.div>
                    </motion.div>
                </form>
            </CardContent>
        </Card>
    );
}
