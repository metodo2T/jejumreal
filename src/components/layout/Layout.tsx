import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface LayoutProps {
    children: React.ReactNode;
    user: { id: string; name: string; protocol: string } | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, user }) => {
    return (
        <div className="flex flex-col min-h-screen pb-24 max-w-md mx-auto bg-brand-dark shadow-2xl relative border-x border-white/5">
            <Header user={user} />

            <main className="flex-1 px-6 py-6 overflow-x-hidden">
                {children}
            </main>

            <BottomNav />
        </div>
    );
};
