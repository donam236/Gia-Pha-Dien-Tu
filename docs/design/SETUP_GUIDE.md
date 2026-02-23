# 🚀 Hướng Dẫn Áp Dụng FinMate Style Kit Cho Project Mới

> Hướng dẫn từng bước để thiết lập Design System giống FinMate cho bất kỳ project Next.js nào.
> Thời gian ước tính: **15-20 phút**

---

## Bước 0: Tạo Project (nếu chưa có)

```bash
npx -y create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd my-app
```

---

## Bước 1: Cài Dependencies

```bash
npm install class-variance-authority clsx tailwind-merge framer-motion lucide-react zustand
```

| Package | Vai trò |
| --- | --- |
| `class-variance-authority` | Tạo component variants (Button, Card...) |
| `clsx` + `tailwind-merge` | Merge CSS class names thông minh |
| `framer-motion` | Animations (modal, page transitions) |
| `lucide-react` | Icon library (nhất quán, nhẹ) |
| `zustand` | State management (theme toggle) |

---

## Bước 2: Cấu hình Tailwind

### `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // ============================
                // 🟢 Primary — Tùy chỉnh theo brand
                // ============================
                primary: {
                    50: "#f0fdf4",
                    100: "#dcfce7",
                    200: "#bbf7d0",
                    300: "#86efac",
                    400: "#4ade80",
                    500: "#22c55e", // ← Main brand color
                    600: "#16a34a",
                    700: "#15803d",
                    800: "#166534",
                    900: "#14532d",
                    950: "#052e16",
                },
                // ============================
                // 🟡 Accent — Gold highlights
                // ============================
                accent: {
                    50: "#fefce8",
                    100: "#fef9c3",
                    200: "#fef08a",
                    300: "#fde047",
                    400: "#facc15",
                    500: "#eab308",
                    600: "#ca8a04",
                    700: "#a16207",
                    800: "#854d0e",
                    900: "#713f12",
                    950: "#422006",
                },
                // ============================
                // 🔴🟡🟢 Semantic
                // ============================
                success: { DEFAULT: "#10b981", light: "#d1fae5" },
                warning: { DEFAULT: "#f59e0b", light: "#fef3c7" },
                danger:  { DEFAULT: "#ef4444", light: "#fee2e2" },
                // ============================
                // ⚫ Surface — Neutral UI
                // ============================
                surface: {
                    50: "#fafafa",
                    100: "#f4f4f5",
                    200: "#e4e4e7",
                    300: "#d4d4d8",
                    400: "#a1a1aa",
                    500: "#71717a",
                    600: "#52525b",
                    700: "#3f3f46",
                    800: "#27272a",
                    900: "#18181b",
                    950: "#09090b",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                mono: ["var(--font-mono)", "monospace"],
            },
            borderRadius: {
                "4xl": "2rem",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [],
};

export default config;
```

---

## Bước 3: Thiết lập Global CSS

### `src/app/globals.css`

```css
@import "tailwindcss";

@theme {
    --color-primary-500: #22c55e;
    --color-primary-600: #16a34a;
    --color-accent-500: #eab308;
    --color-surface-50: #f8fafc;
    --color-surface-100: #f1f5f9;
    --color-surface-200: #e2e8f0;
    --color-surface-500: #64748b;
    --color-surface-900: #121214;
    --color-surface-950: #0a0a0b;

    --font-sans: "var(--font-inter)", ui-sans-serif, system-ui, sans-serif;
    --radius-4xl: 2rem;
}

@layer base {
    :root {
        --background: #f8fafc;
        --foreground: #0f172a;
    }

    .dark {
        --background: #0a0a0b;
        --foreground: #fafafa;
    }

    body {
        background-color: var(--background);
        color: var(--foreground);
        @apply antialiased selection:bg-primary-500/30 transition-colors duration-300;
    }
}

@layer utilities {

    /* ========================================
       Glassmorphism
       ======================================== */
    .glass,
    .glass-card {
        @apply transition-all duration-300;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px) saturate(180%);
        border: 1px solid rgba(226, 232, 240, 0.8);
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    }

    .dark .glass,
    .dark .glass-card {
        background: rgba(18, 18, 20, 0.6) !important;
        backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4) !important;
    }

    /* ========================================
       Glow Mesh Background
       ======================================== */
    .glow-mesh {
        background-image:
            radial-gradient(at 0% 0%, rgba(34, 197, 94, 0.08) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(234, 179, 8, 0.05) 0px, transparent 50%);
    }

    .dark .glow-mesh {
        background-image:
            radial-gradient(at 0% 0%, rgba(34, 197, 94, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(234, 179, 8, 0.1) 0px, transparent 50%);
    }

    /* ========================================
       Gradient Border Glow
       ======================================== */
    .border-glow {
        position: relative;
    }

    .border-glow::after {
        content: "";
        position: absolute;
        inset: -1px;
        background: linear-gradient(to right, rgba(34, 197, 94, 0.2), rgba(234, 179, 8, 0.2));
        z-index: -1;
        border-radius: inherit;
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: exclude;
    }

    .dark .border-glow::after {
        background: linear-gradient(to right, rgba(34, 197, 94, 0.4), rgba(234, 179, 8, 0.4));
    }
}
```

---

## Bước 4: Tiện ích `cn()` và UI Store

### `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

### `src/lib/stores.ts`

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
    isSidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';

    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
    devtools(
        persist(
            (set) => ({
                isSidebarOpen: true,
                theme: 'system',

                toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
                setSidebarOpen: (open) => set({ isSidebarOpen: open }),
                setTheme: (theme) => set({ theme }),
                toggleTheme: () => set((s) => ({
                    theme: s.theme === 'dark' ? 'light' : 'dark'
                })),
            }),
            {
                name: 'app-ui', // ← Đổi theo tên project
                partialize: (state) => ({ theme: state.theme, isSidebarOpen: state.isSidebarOpen }),
            }
        ),
        { name: 'UIStore' }
    )
);
```

---

## Bước 5: Setup Font (Inter) trong Layout

### `src/app/layout.tsx`

```tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin', 'vietnamese'],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'My App',
        template: '%s | My App',
    },
    description: 'Description here',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#18181b' },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={`${inter.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
```

---

## Bước 6: Copy UI Components

Tạo các file component cơ bản:

### `src/components/ui/Button.tsx`

```tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md',
                destructive: 'bg-danger text-white hover:bg-red-600 shadow-sm',
                outline: 'border border-surface-200 bg-transparent hover:bg-surface-50 hover:border-surface-300 dark:border-white/10 dark:text-white dark:hover:bg-white/5',
                secondary: 'bg-surface-100 text-surface-900 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-100 dark:hover:bg-surface-700',
                ghost: 'hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-surface-100',
                link: 'text-primary-500 underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-12 rounded-xl px-8 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### `src/components/ui/Card.tsx`

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'bordered';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-xl transition-all',
                    {
                        'bg-white shadow-sm dark:bg-surface-900': variant === 'default',
                        'glass shadow-lg': variant === 'glass',
                        'border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900': variant === 'bordered',
                    },
                    {
                        'p-0': padding === 'none',
                        'p-4': padding === 'sm',
                        'p-6': padding === 'md',
                        'p-8': padding === 'lg',
                    },
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
    )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-lg font-semibold leading-none tracking-tight text-surface-900 dark:text-white', className)}
            {...props}
        />
    )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn('text-sm text-surface-500 dark:text-surface-400', className)} {...props} />
    )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('', className)} {...props} />
    )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex items-center pt-4', className)} {...props} />
    )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### `src/components/ui/Input.tsx`

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-surface-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        type={type}
                        className={cn(
                            'flex h-11 w-full rounded-xl border border-surface-200 bg-white/70 px-4 py-2 text-sm text-foreground transition-all placeholder:text-surface-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-surface-500 dark:focus:border-primary-500',
                            leftIcon && 'pl-11',
                            rightIcon && 'pr-11',
                            error && 'border-danger focus:border-danger focus:ring-danger/20',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-surface-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-surface-500">{helperText}</p>
                )}
            </div>
        );
    }
);
Input.displayName = 'Input';

export { Input };
```

### `src/components/ui/Modal.tsx`

```tsx
'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    isDark?: boolean;
}

export function Modal({ isOpen, onClose, title, children, isDark = false }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={cn(
                            "relative w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border",
                            isDark ? "bg-surface-900 border-white/10" : "bg-white border-surface-200"
                        )}
                    >
                        <div className="flex items-center justify-between p-8 border-b border-surface-100 dark:border-white/5">
                            <h3 className="text-xl font-black">{title}</h3>
                            <button
                                onClick={onClose}
                                className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-surface-100 dark:hover:bg-white/5 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-8">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
```

### `src/components/ui/Skeleton.tsx`

```tsx
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-surface-200 dark:bg-white/5", className)}
            {...props}
        />
    );
}
```

### `src/components/ui/index.ts`

```typescript
export { Button, buttonVariants } from './Button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './Card';
export { Input } from './Input';
export { Modal } from './Modal';
export { Skeleton } from './Skeleton';
```

---

## Bước 7: Theme Provider (Áp dụng Dark Mode)

### `src/components/providers/ThemeProvider.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/stores';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useUIStore();

    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', isDark);

            const listener = (e: MediaQueryListEvent) => {
                root.classList.toggle('dark', e.matches);
            };
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
            return () => {
                window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
            };
        } else {
            root.classList.toggle('dark', theme === 'dark');
        }
    }, [theme]);

    return <>{children}</>;
}
```

Wrap trong `layout.tsx`:

```tsx
<body className={`${inter.variable} antialiased`}>
    <ThemeProvider>
        {children}
    </ThemeProvider>
</body>
```

---

## Bước 8: Test Nhanh

Tạo `src/app/page.tsx` để kiểm tra toàn bộ Style Kit:

```tsx
'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUIStore } from '@/lib/stores';
import { Sun, Moon, Search, Sparkles } from 'lucide-react';

export default function StyleTestPage() {
    const { theme, toggleTheme } = useUIStore();

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950 glow-mesh p-8 lg:p-16">
            {/* Theme Toggle */}
            <div className="flex justify-end mb-8">
                <Button variant="outline" size="icon" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
            </div>

            {/* Hero */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-400 shadow-sm mb-6">
                    <Sparkles className="h-4 w-4" />
                    FinMate Style Kit
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight text-surface-900 dark:text-white">
                    Design System
                    <span className="block bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 bg-clip-text text-transparent italic">
                        Ready to Use
                    </span>
                </h1>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Buttons */}
                <Card variant="glass" padding="lg">
                    <CardHeader>
                        <CardTitle>Buttons</CardTitle>
                        <CardDescription>All button variants</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Button>Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="destructive">Danger</Button>
                            <Button variant="link">Link</Button>
                            <Button isLoading>Loading</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Inputs */}
                <Card variant="bordered" padding="lg">
                    <CardHeader>
                        <CardTitle>Inputs</CardTitle>
                        <CardDescription>Form input styles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mt-4">
                            <Input label="Search" placeholder="Type something..." leftIcon={<Search className="h-4 w-4" />} />
                            <Input label="With Error" error="This field is required" placeholder="Error state" />
                            <Input label="Helper Text" helperText="This is helper text" placeholder="Normal input" />
                        </div>
                    </CardContent>
                </Card>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card variant="default" padding="md">
                        <CardTitle>Default Card</CardTitle>
                        <CardDescription className="mt-2">Clean shadows</CardDescription>
                    </Card>
                    <Card variant="glass" padding="md">
                        <CardTitle>Glass Card</CardTitle>
                        <CardDescription className="mt-2">Glassmorphism effect</CardDescription>
                    </Card>
                    <Card variant="bordered" padding="md">
                        <CardTitle>Bordered Card</CardTitle>
                        <CardDescription className="mt-2">Subtle borders</CardDescription>
                    </Card>
                </div>

                {/* Skeletons */}
                <Card variant="bordered" padding="lg">
                    <CardHeader>
                        <CardTitle>Loading States</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 mt-4">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
```

---

## ✅ Checklist Hoàn Tất

- [ ] Dependencies installed (`cva`, `clsx`, `tailwind-merge`, `framer-motion`, `lucide-react`, `zustand`)
- [ ] `tailwind.config.ts` — Color palette + animations configured
- [ ] `globals.css` — CSS variables + glass/glow utilities
- [ ] `src/lib/utils.ts` — `cn()` helper
- [ ] `src/lib/stores.ts` — `useUIStore` (theme toggle)
- [ ] `src/app/layout.tsx` — Inter font + antialiased
- [ ] `src/components/ui/` — Button, Card, Input, Modal, Skeleton
- [ ] `src/components/providers/ThemeProvider.tsx` — Dark mode toggle
- [ ] Test page works in both Light and Dark modes

---

## 🎨 Tuỳ Chỉnh Brand Color

Nếu muốn thay đổi brand color (ví dụ từ Green → Blue):

1. Thay toàn bộ `primary-*` values trong `tailwind.config.ts`
2. Cập nhật `--color-primary-*` trong `globals.css`
3. Cập nhật RGB values trong `.glass`, `.glow-mesh`, `.border-glow` (thay `34, 197, 94` bằng RGB mới)

**Bảng màu gợi ý:**

| Brand | 500 | Glow RGB |
| --- | --- | --- |
| 🟢 Green (Default) | `#22c55e` | `34, 197, 94` |
| 🔵 Blue | `#3b82f6` | `59, 130, 246` |
| 🟣 Purple | `#8b5cf6` | `139, 92, 246` |
| 🩷 Pink | `#ec4899` | `236, 72, 153` |
| 🟠 Orange | `#f97316` | `249, 115, 22` |

---

## 📁 Cấu Trúc Thư Mục Cuối

```
src/
├── app/
│   ├── globals.css           ← Design tokens + utilities
│   ├── layout.tsx            ← Font + ThemeProvider
│   └── page.tsx              ← Test page
├── components/
│   ├── providers/
│   │   └── ThemeProvider.tsx  ← Dark mode logic
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Skeleton.tsx
│       └── index.ts
└── lib/
    ├── stores.ts             ← Zustand UI store
    └── utils.ts              ← cn() helper
```

---

*Generated from FinMate v0.3.2 · 2026-02-12*
