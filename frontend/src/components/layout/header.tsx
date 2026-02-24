'use client';

import { Moon, Sun, LogOut, User, LogIn } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from '@/components/notification-bell';
import { useAuth } from '@/components/auth-provider';

export function Header() {
    const { theme, setTheme } = useTheme();
    const { isLoggedIn, profile, isAdmin, signOut } = useAuth();
    const router = useRouter();

    const initials = profile?.display_name
        ? profile.display_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : profile?.email?.slice(0, 2).toUpperCase() || '?';

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-[40] flex h-16 items-center justify-between border-b border-surface-200/50 dark:border-white/5 bg-white/70 dark:bg-surface-950/70 backdrop-blur-xl px-6 lg:px-8">
            <div className="flex items-center gap-4">
                <div className="lg:hidden">
                    {/* Mobile Menu indicator or toggle would go here */}
                </div>
                <h2 className="text-sm font-bold tracking-wider uppercase text-surface-400 dark:text-surface-500">
                    Dòng họ Đỗ Quý
                </h2>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="rounded-xl hover:bg-surface-100 dark:hover:bg-white/5"
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                <NotificationBell />

                {isLoggedIn ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-xl overflow-hidden p-0 border border-surface-200 dark:border-white/10 hover:border-primary-500/50 transition-all">
                                <Avatar className="h-full w-full">
                                    <AvatarFallback className="bg-primary-500 text-white font-bold text-xs">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 mt-2 rounded-2xl glass p-2 border-white/10" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal p-3">
                                <div className="flex flex-col space-y-2">
                                    <p className="text-sm font-black leading-none text-surface-900 dark:text-white">
                                        {profile?.display_name || 'Thành viên'}
                                    </p>
                                    <p className="text-xs leading-none text-surface-500">
                                        {profile?.email}
                                    </p>
                                    {isAdmin && (
                                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 w-fit">
                                            QUẢN TRỊ VIÊN
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-surface-100 dark:bg-white/5" />
                            <DropdownMenuItem className="p-3 rounded-xl cursor-pointer hover:bg-primary-500/10 hover:text-primary-500 transition-all focus:bg-primary-500/10 focus:text-primary-500">
                                <User className="mr-3 h-4 w-4" />
                                <span className="font-medium">Hồ sơ cá nhân</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-surface-100 dark:bg-white/5" />
                            <DropdownMenuItem className="p-3 rounded-xl cursor-pointer text-danger hover:bg-danger/10 transition-all focus:bg-danger/10" onClick={handleSignOut}>
                                <LogOut className="mr-3 h-4 w-4" />
                                <span className="font-medium">Đăng xuất</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link href="/login">
                        <Button variant="default" size="sm" className="font-bold rounded-xl px-5">
                            <LogIn className="h-4 w-4 mr-2" /> Đăng nhập
                        </Button>
                    </Link>
                )}
            </div>
        </header>
    );
}
