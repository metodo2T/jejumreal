import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, ...props }) => {
    return (
        <div
            className={`bg-brand-card rounded-3xl border border-white/5 shadow-xl shadow-black/20 ${noPadding ? '' : 'p-6'} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
