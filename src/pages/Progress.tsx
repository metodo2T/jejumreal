import React, { useState, useEffect } from 'react';
import { UserProgress } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Progress: React.FC = () => {
  const [history, setHistory] = useState<UserProgress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [abdomen, setAbdomen] = useState('');

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('progressHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    } else {
      // Empty state by default
      setHistory([]);
    }
  }, []);

  const handleSave = () => {
    if (!weight) return;

    const entry: UserProgress = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(weight),
      waist: parseFloat(waist) || 0,
      hips: parseFloat(hips) || 0,
      abdomen: parseFloat(abdomen) || 0,
      thigh: 0,
      arm: 0
    };

    const newHistory = [...history, entry];
    setHistory(newHistory);
    localStorage.setItem('progressHistory', JSON.stringify(newHistory));
    setShowForm(false);

    // Reset form
    setWeight('');
    setWaist('');
    setHips('');
    setAbdomen('');

    alert("Parabéns pelo registro! Manter o foco nas medidas é o segredo da constância. 🚀");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-gold-light tracking-tight mb-1">Meu Progresso</h2>
          <p className="text-sm text-brand-text/70">Acompanhe sua evolução mensal.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-card text-brand-gold p-3 rounded-2xl shadow-lg active:scale-95 transition-transform hover:bg-brand-dark hover:border-brand-gold/50 border border-brand-gold/30"
        >
          {showForm ? 'Fechar' : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
        </button>
      </header>

      {showForm && (
        <div className="bg-brand-dark/50 p-6 rounded-[32px] shadow-2xl shadow-black/40 border border-white/10 animate-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-brand-gold-light mb-4 flex items-center gap-2">
            <span>📝</span> Novo Registro
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Peso (kg)" value={weight} onChange={setWeight} type="number" />
              <Input label="Cintura (cm)" value={waist} onChange={setWaist} type="number" />
              <Input label="Quadril (cm)" value={hips} onChange={setHips} type="number" />
              <Input label="Abdômen (cm)" value={abdomen} onChange={setAbdomen} type="number" />
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-brand-gold text-brand-dark font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg hover:bg-brand-gold-light transition-all shadow-brand-gold/20 active:scale-[0.98]"
            >
              Salvar Registro
            </button>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="bg-brand-card p-8 rounded-[32px] border border-white/5 shadow-lg text-center animate-in zoom-in-95 duration-500 shadow-black/20">
          <div className="w-20 h-20 bg-brand-dark rounded-full border border-white/5 flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner">
            🌱
          </div>
          <h3 className="text-xl font-bold text-brand-gold-light mb-2">Sua jornada começa hoje!</h3>
          <p className="text-sm text-brand-text/60 mb-8 font-medium leading-relaxed">Registre seu peso inicial para darmos o primeiro passo rumo à sua melhor versão.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-gold/10 text-brand-gold border border-brand-gold/30 font-black uppercase tracking-widest text-[11px] py-3.5 px-6 rounded-2xl hover:bg-brand-gold/20 transition-all active:scale-[0.98]"
          >
            Fazer Primeiro Registro
          </button>
        </div>
      ) : (
        <>
          <div className="bg-brand-card p-6 rounded-[32px] border border-white/5 shadow-lg shadow-black/20 min-h-[220px]">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-brand-text/50 uppercase tracking-widest mb-6 border-b border-white/5 pb-3">
              <span>📈</span> Curva de Peso
            </h4>
            <div className="h-56 w-full -ml-4">
              {isClient && history.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1C2920', borderRadius: '16px', border: '1px solid #D4AF3740', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#F2E8C6' }}
                      itemStyle={{ fontWeight: '900', color: '#D4AF37' }}
                      labelStyle={{ display: 'none' }}
                      cursor={{ stroke: '#D4AF3740', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#D4AF37" strokeWidth={4} dot={{ r: 5, fill: '#1C2920', strokeWidth: 2, stroke: '#D4AF37' }} activeDot={{ r: 8, fill: '#D4AF37' }} animationDuration={1500} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-[10px] font-black text-brand-text/50 uppercase tracking-widest px-2 pt-2">
              <span>⏳</span> Cápsula do Tempo
            </h4>
            {history.slice().reverse().map((entry, index) => (
              <div key={entry.id} className="bg-brand-card p-5 rounded-[24px] border border-white/5 flex justify-between items-center hover:border-brand-gold/30 hover:bg-brand-dark/50 transition-all shadow-lg shadow-black/20 group">
                <div>
                  <p className="text-[10px] font-black text-brand-gold uppercase tracking-widest">{new Date(entry.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', day: 'numeric' })}</p>
                  <div className="flex gap-3 mt-1 items-baseline">
                    <span className="text-2xl font-black text-brand-gold-light tracking-tighter">{entry.weight}<span className="text-[10px] font-bold text-brand-text/40 tracking-wider ml-0.5">KG</span></span>
                    {entry.waist > 0 && (
                      <span className="text-[10px] text-brand-text/50 flex items-center gap-1 font-bold uppercase tracking-widest pt-1">
                        <div className="w-1.5 h-1.5 bg-brand-gold/50 rounded-full"></div>
                        {entry.waist}cm
                      </span>
                    )}
                  </div>
                </div>
                {index < history.length - 1 && history.length > 1 && (
                  <div className="bg-brand-dark text-brand-gold text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-brand-gold/20 shadow-inner">
                    {entry.weight < history[history.length - 1].weight ? '📉 ' : ''} {(history[history.length - 1].weight - entry.weight).toFixed(1)} kg total
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Input: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string }> = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-[9px] font-black text-brand-gold/80 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-brand-dark border border-white/5 rounded-2xl px-4 py-3.5 text-brand-text font-bold focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-all placeholder-brand-text/20 shadow-inner text-sm"
      placeholder="0.0"
    />
  </div>
);

export default Progress;
