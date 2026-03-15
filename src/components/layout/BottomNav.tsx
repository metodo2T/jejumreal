import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ICONS } from '../../constants';

export const BottomNav: React.FC = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[380px] bg-white border border-gray-200 rounded-[32px] flex justify-around py-2.5 px-2 z-40 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <NavItem to="/" icon={<ICONS.Home />} active={isActive('/')} />
            <NavItem to="/protocols" icon={<ICONS.Timer />} active={location.pathname.startsWith('/protocol') || location.pathname === '/protocols'} />
            <NavItem to="/lives" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} active={isActive('/lives')} />
            <NavItem to="/community" icon={<ICONS.Community />} active={isActive('/community')} />
            <NavItem to="/profile" icon={<ICONS.Profile />} active={isActive('/profile')} />
        </nav>
    );
};

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, active }) => (
    <Link
        to={to}
        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${active
            ? 'bg-brand-gold text-brand-yellow shadow-md shadow-brand-gold/20'
            : 'text-gray-400 hover:text-brand-gold hover:bg-brand-yellow/10'
            }`}
    >
        {icon}
    </Link>
);
