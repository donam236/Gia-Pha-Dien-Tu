import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 min-w-0 flex-col lg:pl-0">
                <Header />
                <main className="flex-1 min-w-0 bg-surface-50 dark:bg-surface-950 glow-mesh overflow-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
