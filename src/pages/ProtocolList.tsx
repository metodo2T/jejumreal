import React from 'react';
import { Link } from 'react-router-dom';
import { PROTOCOLS } from '../constants';
import { ProtocolType } from '../types';

const ProtocolList: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-extrabold text-brand-gold-light tracking-tight">Escolha seu Estágio</h2>
        <p className="text-brand-text/70 mt-1 text-sm">Selecione o protocolo ideal para o seu nível atual.</p>
      </header>

      <div className="space-y-4">
        {Object.values(PROTOCOLS).map((protocol) => (
          <Link
            key={protocol.id}
            to={`/protocol/${protocol.id}`}
            className="block bg-brand-card border border-white/5 rounded-3xl p-5 shadow-lg shadow-black/20 hover:border-brand-gold/30 hover:bg-brand-dark/50 transition-all relative overflow-hidden active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-dark rounded-2xl flex flex-col items-center justify-center text-brand-gold border border-white/5 shadow-inner group-hover:bg-brand-gold/10 transition-colors shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Jejuar</span>
                <span className="text-xl font-black mt-0.5">{protocol.id}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-brand-gold-light text-base">{protocol.title}</h3>
                <p className="text-xs text-brand-text/60 line-clamp-1 mt-0.5">{protocol.description}</p>
              </div>
              <div className="text-brand-text/30 group-hover:text-brand-gold transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {protocol.benefits.slice(0, 2).map((benefit, i) => (
                <span key={i} className="text-[10px] bg-brand-dark/50 text-brand-text/80 px-2.5 py-1 rounded-full border border-white/5 font-medium tracking-tight">
                  {benefit}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-brand-gold/10 border border-brand-gold/20 p-5 rounded-3xl shadow-lg">
        <h4 className="text-brand-gold font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
          <span>💡</span> Dica da Mentoria
        </h4>
        <p className="text-xs text-brand-text/90 leading-relaxed font-medium">Não pule etapas! Comece pelo de 12h e suba apenas quando seu corpo não sentir mais fome durante a janela de jejum.</p>
      </div>
    </div>
  );
};

export default ProtocolList;