import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    size = 'md',
    className = '',
    ...props
}) => {

    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-brand-gold text-brand-dark hover:bg-brand-gold-light shadow-lg shadow-brand-gold/20',
        secondary: 'bg-brand-card-hover text-brand-gold hover:bg-white/10',
        outline: 'bg-transparent border-2 border-brand-gold text-brand-gold hover:bg-brand-gold/10',
        ghost: 'bg-transparent text-brand-text hover:text-brand-gold-light hover:bg-brand-card'
    };

    const sizes = {
        sm: 'py-2 px-4 rounded-xl text-xs',
        md: 'py-3.5 px-6 rounded-2xl text-sm',
        lg: 'py-5 px-8 rounded-[24px] text-base'
    };

    return (
        <button
            className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
};
