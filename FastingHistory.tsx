import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const FastingHistory: React.FC = () => {
  const { user } = useAuth();
  const [localHistory, setLocalHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('fastingHistoryLocal');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('fasting_history')
        .select('*')
        .eq('user_id', user.id)
        .order('end_time', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedHistory = data.map((entry: any) => {
          const startD = new Date(entry.start_time);
          const endD = new Date(entry.end_time);
          
          const startDateStr = startD.toLocaleDateString('pt-BR');
          const startTimeStr = startD.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const endDateStr = endD.toLocaleDateString('pt-BR');
          const endTimeStr = endD.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

          const targetHours = parseInt(entry.protocol || '16', 10);
          const targetSeconds = targetHours * 3600;

          return {
            id: entry.id.toString(),
            date: startDateStr === endDateStr ? startDateStr : `${startDateStr} - ${endDateStr}`,
            start: startTimeStr,
            end: endTimeStr,
            duration: formatTime(entry.duration_seconds),
            protocol: entry.protocol || '16h',
            completed: entry.duration_seconds >= targetSeconds
          };
        });
        
        setLocalHistory(formattedHistory);
        localStorage.setItem('fastingHistoryLocal', JSON.stringify(formattedHistory));
      }
    } catch (err) {
      console.warn("Aviso ao buscar histórico do Supabase:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    const handleHistoryUpdate = () => fetchHistory();
    window.addEventListener('fastingHistoryUpdated', handleHistoryUpdate);
    return () => window.removeEventListener('fastingHistoryUpdated', handleHistoryUpdate);
  }, [user?.id]);

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center px-1 border-b border-gray-200 pb-2">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span>🕰️</span> Histórico de Jejuns
        </h3>
      </div>
      {localHistory.length === 0 ? (
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm text-center">
          <p className="text-xs text-gray-400 font-medium">Nenhum jejum concluído ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {localHistory.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-brand-text mb-0.5">{item.date}</p>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Início: {item.start} • Fim: {item.end}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.completed ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20' : 'bg-red-100 text-brand-red border border-red-200'}`}>
                  {item.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FastingHistory;
