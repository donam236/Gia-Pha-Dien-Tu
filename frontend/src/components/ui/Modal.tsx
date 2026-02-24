'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import * as React from 'react';

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
