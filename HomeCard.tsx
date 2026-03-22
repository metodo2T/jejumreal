import React from 'react';
import { Link } from 'react-router-dom';

interface HomeCardProps {
  to: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
}

const HomeCard: React.FC<HomeCardProps> = React.memo(({ to, title, subtitle, color, icon }) => (
  <Link to={to} className={`${color} p-5 rounded-[28px] border border-gray-100 shadow-sm transition-all hover:border-brand-gold/30 hover:shadow-md active:scale-95`}>
    <div className="text-2xl mb-3">{icon}</div>
    <h4 className="font-bold text-brand-text text-sm">{title}</h4>
    <p className="text-[10px] text-gray-500 font-medium uppercase mt-0.5 tracking-tighter">{subtitle}</p>
  </Link>
));

export default HomeCard;
