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
                name: 'gia-pha-ui',
                partialize: (state) => ({ theme: state.theme, isSidebarOpen: state.isSidebarOpen }),
            }
        ),
        { name: 'UIStore' }
    )
);
