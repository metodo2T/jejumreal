import React from 'react';

const Bonus: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header>
        <h2 className="text-2xl font-extrabold text-brand-gold-light tracking-tight mb-1">Bônus Liberados</h2>
        <p className="text-sm text-brand-text/70">Materiais extras para potencializar seus resultados.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <BonusItem
          title="Chás Medicinais"
          description="Guia completo de ervas para saciedade e queima de gordura."
          tag="E-book PDF"
          color="bg-brand-dark"
          icon="🍵"
          accent="text-emerald-400"
          border="border-emerald-500/20"
        />
        <BonusItem
          title="Protocolo Metabólico"
          description="Como destravar seu metabolismo após os 40 anos."
          tag="Aula Especial"
          color="bg-brand-dark"
          icon="🔥"
          accent="text-orange-400"
          border="border-orange-500/20"
        />
        <BonusItem
          title="Receitas Facilitadas"
          description="Mais de 50 receitas rápidas para sua janela alimentar."
          tag="Receitas"
          color="bg-brand-dark"
          icon="🥗"
          accent="text-brand-gold-light"
          border="border-brand-gold/20"
        />
        <BonusItem
          title="Medidas Corporais"
          description="Aprenda a tirar medidas corretamente para o tracking."
          tag="Mini-curso"
          color="bg-brand-dark"
          icon="📏"
          accent="text-blue-400"
          border="border-blue-500/20"
        />
      </div>

      <div className="p-6 bg-brand-gold/10 border border-brand-gold/20 rounded-[32px] text-brand-text shadow-lg shadow-black/20 relative overflow-hidden group">
        <div className="absolute inset-0 bg-brand-dark/40 group-hover:bg-brand-dark/20 transition-colors"></div>
        <div className="relative z-10">
          <h4 className="font-extrabold text-brand-gold-light tracking-tight text-lg mb-1 flex items-center gap-2">
            <span>🥩</span> Cálculo de Proteína
          </h4>
          <p className="text-xs text-brand-text/80 mb-6 font-medium leading-relaxed">Descubra quanto de proteína seu corpo precisa para não perder massa magra.</p>
          <button onClick={() => alert("Calculadora em breve!")} className="bg-brand-gold text-brand-dark px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-gold-light shadow-lg hover:shadow-brand-gold/20 transition-all active:scale-[0.98]">
            Acessar Calculadora
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg className="w-32 h-32 text-brand-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
        </div>
      </div>
    </div>
  );
};

const BonusItem: React.FC<{ title: string; description: string; tag: string; color: string; icon: string; accent: string; border: string }> = ({ title, description, tag, color, icon, accent, border }) => (
  <div onClick={() => alert("Este bônus será liberado em breve!")} className={`${color} p-5 rounded-[24px] flex gap-4 items-center border ${border} shadow-lg shadow-black/20 hover:border-brand-gold/40 hover:bg-brand-card transition-all cursor-pointer group`}>
    <div className={`text-3xl bg-brand-card/50 border border-white/5 w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 group-hover:bg-brand-dark transition-all`}>
      <span className="group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)] transition-all">{icon}</span>
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-0.5">
        <h3 className={`font-bold ${accent} tracking-tight group-hover:text-brand-gold transition-colors`}>{title}</h3>
        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/20 border border-white/5 text-brand-text/50 shadow-inner group-hover:border-brand-gold/20 group-hover:text-brand-gold/80 transition-all">
          {tag}
        </span>
      </div>
      <p className="text-[11px] text-brand-text/60 mt-1 leading-relaxed font-medium group-hover:text-brand-text/80 transition-colors">{description}</p>
    </div>
  </div>
);

export default Bonus;
