import React, { useState, useEffect } from 'react';

const FOOD_DB = [
  { id: 1, name: 'Água com limão', breaks: false, desc: 'O limão espremido na água não tem calorias suficientes para quebrar o jejum.' },
  { id: 2, name: 'Café sem açúcar', breaks: false, desc: 'Liberado! Ajuda na energia e não afeta a insulina.' },
  { id: 3, name: 'Adoçante Stevia', breaks: false, desc: 'Pode ser usado com moderação, não eleva a insulina.' },
  { id: 4, name: 'Leite', breaks: true, desc: 'Contém lactose (açúcar do leite) e proteínas que ativam a digestão e quebram o jejum.' },
  { id: 5, name: 'Bala sem açúcar', breaks: true, desc: 'Muitas contêm maltitol ou outros adoçantes que elevam a insulina.' },
  { id: 6, name: 'Chá verde', breaks: false, desc: 'Excelente termogênico, totalmente liberado sem açúcar.' },
  { id: 7, name: 'Whey Protein', breaks: true, desc: 'Proteína pura, ativa a digestão e quebra o jejum instantaneamente.' },
  { id: 8, name: 'Caldo de ossos', breaks: true, desc: 'Apesar de nutritivo, contém proteínas e calorias que quebram o jejum.' },
  { id: 9, name: 'Água com gás', breaks: false, desc: 'Totalmente liberada, ajuda muito na saciedade.' },
  { id: 10, name: 'BCAA', breaks: true, desc: 'Aminoácidos ativam a via mTOR e quebram o jejum.' },
];

const GROCERY_LIST = [
  { category: 'Proteínas', items: ['Ovos', 'Peito de Frango', 'Carne moída (Patinho)', 'Atum em lata', 'Queijo curado'] },
  { category: 'Hortifruti', items: ['Abacate', 'Limão', 'Folhas verdes', 'Brócolis', 'Abobrinha', 'Morango'] },
  { category: 'Gorduras Boas', items: ['Azeite de oliva extra virgem', 'Manteiga Ghee', 'Castanhas', 'Óleo de coco'] },
  { category: 'Bebidas & Outros', items: ['Café em pó', 'Chá verde', 'Chá de camomila', 'Água com gás', 'Sal integral'] },
];

const Kit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculadora' | 'buscador' | 'mercado'>('calculadora');

  // Calculadora State
  const [weight, setWeight] = useState('');
  const [waterGoal, setWaterGoal] = useState<number | null>(null);
  const [proteinGoal, setProteinGoal] = useState<number | null>(null);

  // Buscador State
  const [searchQuery, setSearchQuery] = useState('');

  // Mercado State
  const [checkedItems, setCheckedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('groceryList');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('groceryList', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const handleCalculate = () => {
    const w = parseFloat(weight);
    if (w > 0) {
      setWaterGoal(w * 35); // 35ml por kg
      setProteinGoal(w * 1.5); // 1.5g de proteína por kg (média boa para emagrecimento/manutenção)
    }
  };

  const toggleItem = (item: string) => {
    setCheckedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const searchResults = searchQuery.trim() === ''
    ? []
    : FOOD_DB.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header>
        <h2 className="text-2xl font-extrabold text-brand-gold-light tracking-tight mb-1">Kit Salva-vidas</h2>
        <p className="text-sm text-brand-text/70">Suas ferramentas diárias para o jejum.</p>
      </header>

      <div className="flex bg-brand-dark/50 p-1 rounded-2xl overflow-x-auto hide-scrollbar border border-white/5">
        <button
          onClick={() => setActiveTab('calculadora')}
          className={`flex-1 min-w-[100px] py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'calculadora' ? 'bg-brand-card text-brand-gold shadow-md border border-brand-gold/10' : 'text-brand-text/50 hover:text-brand-text'}`}
        >
          Metas
        </button>
        <button
          onClick={() => setActiveTab('buscador')}
          className={`flex-1 min-w-[100px] py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'buscador' ? 'bg-brand-card text-brand-gold shadow-md border border-brand-gold/10' : 'text-brand-text/50 hover:text-brand-text'}`}
        >
          Pode ou Não?
        </button>
        <button
          onClick={() => setActiveTab('mercado')}
          className={`flex-1 min-w-[100px] py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'mercado' ? 'bg-brand-card text-brand-gold shadow-md border border-brand-gold/10' : 'text-brand-text/50 hover:text-brand-text'}`}
        >
          Mercado
        </button>
      </div>

      {/* TAB: CALCULADORA */}
      {activeTab === 'calculadora' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <div className="bg-brand-card p-6 rounded-[32px] border border-white/5 shadow-lg shadow-black/20">
            <h3 className="font-bold text-brand-gold-light mb-2 flex items-center gap-2.5">
              <span>🎯</span> Calculadora de Metas
            </h3>
            <p className="text-xs text-brand-text/60 mb-5 leading-relaxed font-medium">Descubra quanto de água e proteína seu corpo precisa diariamente para emagrecer com saúde.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-[9px] font-black text-brand-gold/80 uppercase tracking-widest mb-1.5 ml-1">Seu peso atual (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ex: 70"
                  className="w-full bg-brand-dark border border-white/5 rounded-2xl px-4 py-3.5 text-brand-text font-bold focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all shadow-inner placeholder-brand-text/20"
                />
              </div>
              <button
                onClick={handleCalculate}
                className="w-full bg-brand-gold text-brand-dark font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-brand-gold/20 hover:bg-brand-gold-light transition-all active:scale-[0.98] text-[11px]"
              >
                Calcular Minhas Metas
              </button>
            </div>
          </div>

          {waterGoal && proteinGoal && (
            <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95">
              <div className="bg-brand-card p-5 rounded-[24px] border border-white/5 flex flex-col items-center text-center shadow-lg shadow-black/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                <div className="w-12 h-12 bg-brand-dark border border-white/5 rounded-full flex items-center justify-center text-2xl mb-3 shadow-inner relative z-10 group-hover:scale-110 transition-transform">💧</div>
                <h4 className="text-[9px] font-black text-brand-text/50 uppercase tracking-widest mb-1 relative z-10">Meta de Água</h4>
                <span className="text-2xl font-black text-brand-gold-light tracking-tighter relative z-10">{(waterGoal / 1000).toFixed(1)}<span className="text-sm">L</span></span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gold/60 mt-1 relative z-10">por dia</p>
              </div>
              <div className="bg-brand-card p-5 rounded-[24px] border border-white/5 flex flex-col items-center text-center shadow-lg shadow-black/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors"></div>
                <div className="w-12 h-12 bg-brand-dark border border-white/5 rounded-full flex items-center justify-center text-2xl mb-3 shadow-inner relative z-10 group-hover:scale-110 transition-transform">🥩</div>
                <h4 className="text-[9px] font-black text-brand-text/50 uppercase tracking-widest mb-1 relative z-10">Meta de Proteína</h4>
                <span className="text-2xl font-black text-brand-gold-light tracking-tighter relative z-10">{Math.round(proteinGoal)}<span className="text-sm">g</span></span>
                <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gold/60 mt-1 relative z-10">por dia</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: BUSCADOR */}
      {activeTab === 'buscador' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
          <div className="bg-brand-card p-6 rounded-[32px] border border-white/5 shadow-lg shadow-black/20">
            <h3 className="font-bold text-brand-gold-light mb-2 flex items-center gap-2.5">
              <span className="opacity-90">🔍</span> Quebra ou não quebra?
            </h3>
            <p className="text-xs text-brand-text/60 mb-5 leading-relaxed font-medium">Na dúvida se pode consumir algo durante a janela de jejum? Pesquise abaixo.</p>

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-brand-gold/50 group-focus-within:text-brand-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Limão, Café, Leite..."
                className="w-full bg-brand-dark border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-brand-text font-bold focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all shadow-inner placeholder-brand-text/20 text-sm"
              />
            </div>
          </div>

          {searchQuery && searchResults.length === 0 && (
            <div className="text-center p-8 text-brand-text/40 text-sm font-medium bg-brand-card rounded-3xl border border-white/5">
              Nenhum alimento encontrado com <span className="text-brand-gold">"{searchQuery}"</span>.<br />Tente outro termo.
            </div>
          )}

          <div className="space-y-3">
            {searchResults.map((item) => (
              <div key={item.id} className={`p-5 rounded-[24px] border ${item.breaks ? 'bg-red-950/20 border-red-900/30' : 'bg-brand-card border-brand-gold/20'} flex gap-4 items-start animate-in zoom-in-95 shadow-sm`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border shadow-inner ${item.breaks ? 'bg-red-900/30 text-red-400 border-red-500/20' : 'bg-brand-dark text-brand-gold border-brand-gold/30'}`}>
                  {item.breaks ? '❌' : '✅'}
                </div>
                <div className="pt-0.5">
                  <div className="flex items-center gap-2.5 mb-1">
                    <h4 className={`font-bold ${item.breaks ? 'text-red-400' : 'text-brand-gold-light'}`}>{item.name}</h4>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${item.breaks ? 'bg-red-900/30 text-red-300 border-red-800/50' : 'bg-brand-gold/10 text-brand-gold border-brand-gold/30'}`}>
                      {item.breaks ? 'Quebra' : 'Liberado'}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed font-medium ${item.breaks ? 'text-red-200/60' : 'text-brand-text/70'}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MERCADO */}
      {activeTab === 'mercado' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="bg-brand-dark border border-brand-gold/20 p-6 flex items-start gap-4 rounded-[32px] shadow-lg shadow-black/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 opacity-50"></div>
            <div className="text-3xl relative z-10 opacity-90">🛒</div>
            <div className="relative z-10 pt-1">
              <h3 className="font-black text-brand-gold uppercase tracking-widest text-[11px] mb-1.5">Checklist Inteligente</h3>
              <p className="text-brand-text/70 leading-relaxed text-xs font-medium">O segredo do jejum é ter a geladeira preparada. Marque o que já comprou.</p>
            </div>
          </div>

          <div className="space-y-4">
            {GROCERY_LIST.map((category, idx) => (
              <div key={idx} className="bg-brand-card p-5 rounded-[24px] border border-white/5 shadow-lg shadow-black/20">
                <h4 className="font-black text-[11px] text-brand-text/50 uppercase tracking-widest mb-4 flex items-center gap-2.5 border-b border-white/5 pb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold/70"></span>
                  {category.category}
                </h4>
                <div className="space-y-1.5 pl-1">
                  {category.items.map((item, i) => {
                    const isChecked = checkedItems.includes(item);
                    return (
                      <label key={i} className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-brand-dark/50 transition-colors cursor-pointer group active:scale-[0.99]">
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isChecked ? 'bg-brand-gold border-brand-gold text-brand-dark shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-brand-dark border-white/10 group-hover:border-brand-gold/50 text-transparent'}`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-brand-text/30 line-through decoration-brand-text/20' : 'text-brand-text/90 group-hover:text-brand-gold-light'}`}>
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Kit;
