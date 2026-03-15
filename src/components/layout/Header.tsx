import React from 'react';
import { Link } from 'react-router-dom';
import { AppUser } from '../../types';

interface HeaderProps {
    user: AppUser | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
    return (
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0 z-30 flex justify-between items-center h-[72px]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-brand-dark">
                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <h1 className="text-xl font-black tracking-tighter text-brand-gold uppercase">Facilitando seu jejum</h1>
            </div>
            <Link
                to="/profile"
                className="w-10 h-10 bg-brand-dark rounded-2xl border border-gray-200 flex items-center justify-center shadow-sm transition-colors shrink-0 overflow-hidden"
            >
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-sm font-black text-brand-gold uppercase">
                        {user?.name ? user.name[0] : 'U'}
                    </span>
                )}
            </Link>
        </header>
    );
};
