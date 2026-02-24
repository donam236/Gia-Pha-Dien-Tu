'use client';

import { motion } from 'framer-motion';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-950 px-4 overflow-hidden">
            {/* Ambient Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-500/10 dark:bg-primary-500/20 blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -40, 0],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-amber-500/10 dark:bg-amber-500/20 blur-[150px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, 30, 0],
                        y: [0, -40, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-rose-500/10 dark:bg-rose-500/20 blur-[100px]"
                />
            </div>

            {/* Content Container */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[450px]"
            >
                {/* Decorative border glow */}
                <div className="absolute -inset-1 rounded-[3.5rem] bg-gradient-to-tr from-primary-500/20 via-transparent to-amber-500/20 blur-sm opacity-50" />

                {children}
            </motion.div>
        </div>
    );
}
