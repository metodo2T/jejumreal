import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PROTOCOLS } from '../constants';
import { ProtocolType } from '../types';

const ProtocolDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const protocol = PROTOCOLS[id as ProtocolType];
  const [activeTab, setActiveTab] = useState<'guia' | 'quebra'>('guia');

  if (!protocol) return <div className="p-6 text-center text-brand-text/50 font-bold">Protocolo não encontrado.</div>;

  return (
    <div className="pb-10 animate-in fade-in duration-500">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-brand-gold font-bold text-sm hover:text-brand-gold-light transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Voltar
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-brand-dark rounded-[24px] flex items-center justify-center text-brand-gold shadow-lg shadow-black/40 shrink-0 border border-brand-gold/20">
          <span className="text-xl font-black">{protocol.id}</span>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-brand-gold-light tracking-tight">{protocol.title}</h2>
          <p className="text-brand-text/60 text-xs font-medium uppercase tracking-wider">{protocol.description}</p>
        </div>
      </div>

      {protocol.pdfUrl && (
        <a
          href={protocol.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-brand-gold text-brand-dark font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg hover:shadow-brand-gold/20 hover:bg-brand-gold-light transition-all active:scale-[0.98] mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar Material em PDF
        </a>
      )}

      <div className="flex bg-brand-dark/50 p-1 rounded-2xl mb-8 border border-white/5">
        <button
          onClick={() => setActiveTab('guia')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'guia' ? 'bg-brand-card text-brand-gold shadow-md border border-brand-gold/10' : 'text-brand-text/60 hover:text-brand-text'}`}
        >
          Guia Prático
        </button>
        <button
          onClick={() => setActiveTab('quebra')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'quebra' ? 'bg-brand-card text-brand-gold shadow-md border border-brand-gold/10' : 'text-brand-text/60 hover:text-brand-text'}`}
        >
          Quebra do Jejum
        </button>
      </div>

      {activeTab === 'guia' ? (
        <div className="space-y-4">
          <Section title="Benefícios Principais" items={protocol.benefits} icon="✨" />
          <Section title="Para quem é indicado?" content={protocol.indicatedFor} icon="👤" />
          <Section title="Como começar agora?" content={protocol.howToStart} icon="🚀" />
          <Section title="Pode consumir no Jejum" items={protocol.allowedDuring} icon="☕" />
          <Section title="Erros Comuns" items={protocol.commonMistakes} icon="⚠️" color="text-red-400" />
        </div>
      ) : (
        <div className="space-y-4">
          <MenuCard title="Opção Básica" items={protocol.menus.basic} difficulty="Iniciante" />
          <MenuCard title="Opção Intermediária" items={protocol.menus.intermediate} difficulty="Moderado" />
          <MenuCard title="Opção Avançada" items={protocol.menus.advanced} difficulty="Protocolo Limpo" />

          <div className="bg-brand-dark/30 border border-brand-gold/20 p-6 rounded-[32px] shadow-lg">
            <h4 className="font-bold text-brand-gold-light text-sm mb-3">💡 Substituições Inteligentes:</h4>
            <ul className="text-xs text-brand-text/80 space-y-3 font-medium">
              <li className="flex gap-2"><span className="text-brand-gold">•</span> <span>Troque <strong className="text-brand-gold-light">Frango</strong> por <strong className="text-brand-gold-light">Ovos</strong> ou <strong className="text-brand-gold-light">Peixe branco</strong>.</span></li>
              <li className="flex gap-2"><span className="text-brand-gold">•</span> <span>Troque <strong className="text-brand-gold-light">Castanhas</strong> por <strong className="text-brand-gold-light">Meio abacate</strong> ou <strong className="text-brand-gold-light">Azeite</strong>.</span></li>
              <li className="flex gap-2"><span className="text-brand-gold">•</span> <span>Troque <strong className="text-brand-gold-light">Folhas verdes</strong> por <strong className="text-brand-gold-light">Vegetais cozidos</strong> no vapor.</span></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const Section: React.FC<{ title: string; content?: string; items?: string[]; icon: string; color?: string }> = ({ title, content, items, icon, color = 'text-brand-gold-light' }) => (
  <div className="bg-brand-card rounded-[28px] p-6 shadow-lg shadow-black/20 border border-white/5">
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xl opacity-90">{icon}</span>
      <h3 className={`font-bold text-sm uppercase tracking-wider ${color}`}>{title}</h3>
    </div>
    {content && <p className="text-sm text-brand-text/80 leading-relaxed font-medium">{content}</p>}
    {items && (
      <ul className="space-y-2 mt-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-brand-text/80 flex gap-2 font-medium">
            <span className="text-brand-gold font-bold">•</span>
            {item}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const MenuCard: React.FC<{ title: string; items: string[]; difficulty: string }> = ({ title, items, difficulty }) => (
  <div className="bg-brand-card border border-white/5 rounded-[32px] overflow-hidden shadow-lg shadow-black/20">
    <div className="bg-brand-dark/50 px-6 py-4 flex justify-between items-center border-b border-white/5">
      <h4 className="text-brand-gold-light font-bold text-sm tracking-tight">{title}</h4>
      <span className="text-[9px] bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">{difficulty}</span>
    </div>
    <div className="p-6">
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-brand-text/90 flex items-center gap-3 font-medium">
            <div className="w-1.5 h-1.5 bg-brand-gold rounded-full shrink-0"></div>
            {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default ProtocolDetailView;