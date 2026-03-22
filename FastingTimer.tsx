import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AppUser } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const getBodyPhase = (totalSeconds: number) => {
  const hours = totalSeconds / 3600;
  if (hours < 4) return "Açúcar no sangue normalizando";
  if (hours < 8) return "Digestão finalizada";
  if (hours < 12) return "Iniciando queima de gordura";
  if (hours < 16) return "Queima de gordura acelerada";
  return "Autofagia (Renovação celular)";
};

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const FastingTimer: React.FC = () => {
  const { user } = useAuth();
  const [fasting, setFasting] = useState(false);
  const [fastingStart, setFastingStart] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showActiveBanner, setShowActiveBanner] = useState(true);

  const targetHours = parseInt(user?.protocol || '16', 10);
  const targetSeconds = targetHours * 3600;
  const progress = Math.min(seconds / targetSeconds, 1);

  const [targetReached, setTargetReached] = useState(() => {
    return localStorage.getItem('targetReached') === 'true';
  });

  // Fetch active session from Firestore/Supabase
  useEffect(() => {
    if (!user?.id) return;

    const fetchActiveSession = async () => {
      const localFasting = localStorage.getItem('fasting') === 'true';
      const localPaused = localStorage.getItem('fastingPaused') === 'true';
      const localStart = localStorage.getItem('fastingStart');
      const localSeconds = localStorage.getItem('fastingSeconds');

      if (localFasting && localStart) {
        setFasting(true);
        setFastingStart(parseInt(localStart, 10));
        if (localPaused && localSeconds) {
          setIsPaused(true);
          setSeconds(parseInt(localSeconds, 10));
        } else {
          setSeconds(Math.floor((Date.now() - parseInt(localStart, 10)) / 1000));
        }
      }

      try {
        const snapshotPromise = supabase
          .from('fasting_sessions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'paused'])
          .limit(1);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Supabase timeout')), 3000)
        );

        const response = await Promise.race([snapshotPromise, timeoutPromise]) as { data: any[] } | null;
        const snapshot = response?.data;

        if (snapshot && snapshot.length > 0) {
          const sessionDoc = snapshot[0];
          setSessionId(sessionDoc.id);
          setFasting(true);

          let startMs = Date.now();
          if (sessionDoc.start_time) {
            startMs = new Date(sessionDoc.start_time).getTime();
          } else {
            const localStart = localStorage.getItem('fastingStart');
            if (localStart) startMs = parseInt(localStart, 10);
          }
          setFastingStart(startMs);

          if (sessionDoc.status === 'paused') {
            setIsPaused(true);
            if (sessionDoc.end_time) {
              const pauseEnd = new Date(sessionDoc.end_time).getTime();
              setSeconds(Math.floor((pauseEnd - startMs) / 1000));
            } else {
              const localSeconds = localStorage.getItem('fastingSeconds');
              if (localSeconds) setSeconds(parseInt(localSeconds, 10));
            }
          } else {
            setIsPaused(false);
          }
        } else {
          if (!localFasting) {
            setFasting(false);
            setFastingStart(null);
            setSessionId(null);
            setIsPaused(false);
          }
        }
      } catch (error) {
        console.warn("Aviso ao buscar sessão ativa (usando fallback local)", error);
      }
    };

    fetchActiveSession();
  }, [user?.id]);

  // Timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (fasting && fastingStart && !isPaused) {
      const updateSeconds = () => {
        const currentSecs = Math.floor((Date.now() - fastingStart) / 1000);
        setSeconds(currentSecs);
        localStorage.setItem('fastingSeconds', currentSecs.toString());
        localStorage.setItem('fastingStart', fastingStart.toString());
        localStorage.setItem('fasting', 'true');
      };
      updateSeconds();
      interval = setInterval(updateSeconds, 1000);
    } else if (!fasting) {
      const localFasting = localStorage.getItem('fasting') === 'true';
      if (!localFasting) {
        setSeconds(0);
        localStorage.setItem('fasting', 'false');
        localStorage.removeItem('fastingStart');
        localStorage.removeItem('fastingSeconds');
      }
    }
    return () => clearInterval(interval);
  }, [fasting, fastingStart, isPaused]);

  useEffect(() => {
    if (fasting) setShowActiveBanner(true);
  }, [fasting]);

  useEffect(() => {
    if (fasting) {
      const remaining = Math.max(0, targetSeconds - seconds);
      const h = Math.floor(remaining / 3600).toString().padStart(2, '0');
      const m = Math.floor((remaining % 3600) / 60).toString().padStart(2, '0');
      document.title = `⏳ ${h}:${m} - Jejum Ativo`;
    } else {
      document.title = 'Jejum App';
    }
  }, [fasting, seconds, targetSeconds]);

  useEffect(() => {
    if (fasting && seconds >= targetSeconds && !targetReached) {
      setTargetReached(true);
      localStorage.setItem('targetReached', 'true');
      if ("Notification" in window && Notification.permission === 'granted') {
        new Notification("Meta Atingida! 🎉", {
          body: `Você completou suas ${targetHours}h de jejum! Parabéns!`
        });
      }
    }
  }, [seconds, fasting, targetSeconds, targetReached, targetHours]);

  const toggleFasting = async () => {
    if (!user?.id) return;

    if (fasting) {
      // Encerrar jejum
      setFasting(false);
      setIsPaused(false);
      setFastingStart(null);
      setTargetReached(false);
      localStorage.removeItem('targetReached');
      localStorage.setItem('fasting', 'false');
      localStorage.removeItem('fastingStart');
      localStorage.removeItem('fastingPaused');
      localStorage.removeItem('fastingSeconds');

      if (sessionId) {
        supabase.from('fasting_sessions').update({
          status: 'completed',
          end_time: new Date().toISOString(),
          duration_hours: seconds / 3600,
          completed_percentage: progress * 100,
          metabolic_phase: getBodyPhase(seconds)
        }).eq('id', sessionId).then();
        setSessionId(null);
      }

      // Save to history
      const startD = new Date(fastingStart || (Date.now() - (seconds * 1000)));
      const endD = new Date();
      
      const startDateStr = startD.toLocaleDateString('pt-BR');
      const startTimeStr = startD.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const endDateStr = endD.toLocaleDateString('pt-BR');
      const endTimeStr = endD.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      const historyEntry = {
        user_id: user.id,
        start_time: startD.toISOString(),
        end_time: endD.toISOString(),
        duration_seconds: Math.floor(seconds),
        protocol: user.protocol || '16h',
        completed_percentage: progress * 100,
        metabolic_phase: getBodyPhase(seconds)
      };

      const localEntry = {
        id: Date.now().toString(),
        date: startDateStr === endDateStr ? startDateStr : `${startDateStr} - ${endDateStr}`,
        start: startTimeStr,
        end: endTimeStr,
        duration: formatTime(Math.floor(seconds)),
        protocol: user.protocol || '16h',
        completed: seconds >= targetSeconds
      };

      const existingHistory = JSON.parse(localStorage.getItem('fastingHistoryLocal') || '[]');
      const newLocalHistory = [localEntry, ...existingHistory].slice(0, 5);
      localStorage.setItem('fastingHistoryLocal', JSON.stringify(newLocalHistory));

      supabase.from('fasting_history').insert([historyEntry]).then(() => {
        window.dispatchEvent(new Event('fastingHistoryUpdated'));
      });

    } else {
      // Iniciar jejum
      const now = Date.now();
      setFasting(true);
      setIsPaused(false);
      setFastingStart(now);
      setTargetReached(false);
      localStorage.setItem('targetReached', 'false');
      localStorage.setItem('fasting', 'true');
      localStorage.setItem('fastingStart', now.toString());
      localStorage.removeItem('fastingPaused');
      localStorage.removeItem('fastingSeconds');

      const addPromise = supabase.from('fasting_sessions').insert([{
        user_id: user.id,
        start_time: new Date().toISOString(),
        protocol_type: user.protocol || '16h',
        status: 'active'
      }]).select().single();
      
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
      const response = await Promise.race([addPromise, timeoutPromise]) as { data: { id: string } } | null;
      if (response?.data) setSessionId(response.data.id);
    }
  };

  const togglePause = () => {
    if (isPaused) {
      const newStart = Date.now() - (seconds * 1000);
      setFastingStart(newStart);
      setIsPaused(false);
      localStorage.setItem('fastingStart', newStart.toString());
      localStorage.setItem('fastingPaused', 'false');
      if (sessionId) {
        supabase.from('fasting_sessions').update({ status: 'active', start_time: new Date(newStart).toISOString(), end_time: null }).eq('id', sessionId).then();
      }
    } else {
      setIsPaused(true);
      localStorage.setItem('fastingPaused', 'true');
      localStorage.setItem('fastingSeconds', seconds.toString());
      if (sessionId) {
        supabase.from('fasting_sessions').update({ status: 'paused', end_time: new Date().toISOString() }).eq('id', sessionId).then();
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-200 border border-gray-100 flex flex-col items-center relative overflow-hidden">
        {fasting && (
          <div className="absolute top-4 left-0 w-full text-center animate-in slide-in-from-top-2">
            <span className="bg-brand-gold/10 text-brand-gold-light text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-brand-gold/20">
              Fase: {getBodyPhase(seconds)}
            </span>
          </div>
        )}
        <div className="relative w-56 h-56 flex items-center justify-center mt-4">
          {fasting && (
            <div
              className="absolute inset-0 rounded-full bg-brand-gold animate-pulse pointer-events-none"
              style={{
                opacity: 0.05 + (progress * 0.15),
                filter: `blur(${15 + (progress * 25)}px)`,
                transform: `scale(${1 + (progress * 0.15)})`
              }}
            />
          )}
          <svg className="absolute w-full h-full -rotate-90 z-10">
            <circle cx="112" cy="112" r="100" stroke="rgba(10,108,56,0.1)" strokeWidth="12" fill="none" />
            <circle
              cx="112" cy="112" r="100" stroke="#0a6c38" strokeWidth="12" fill="none"
              strokeDasharray="628"
              strokeDashoffset={628 - (628 * progress)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="text-center z-20">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">
              {fasting ? (isPaused ? 'Pausado' : 'Em Jejum') : 'Repouso'}
            </p>
            <span className="text-4xl font-black text-brand-text tabular-nums">{formatTime(seconds)}</span>
            <p className="text-[10px] font-medium text-gray-400 mt-1">Meta: {user?.protocol}</p>
          </div>
        </div>

        <div className="w-full flex gap-3 mt-8 z-20">
          {fasting && (
            <button
              onClick={togglePause}
              className={`flex-1 py-5 rounded-[24px] font-bold transition-all shadow-md active:scale-95 border ${isPaused ? 'bg-brand-gold text-white border-brand-gold shadow-brand-gold/20' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              {isPaused ? '▶ Retomar' : '⏸ Pausar'}
            </button>
          )}
          <button
            onClick={toggleFasting}
            className={`flex-1 py-5 rounded-[24px] font-bold transition-all shadow-md active:scale-95 ${fasting ? 'bg-brand-red/10 text-brand-red border border-brand-red/20 hover:bg-brand-red/20' : 'bg-brand-gold text-white shadow-brand-gold/20 hover:bg-brand-gold-light'}`}
          >
            {fasting ? 'Encerrar' : 'Iniciar Protocolo Agora'}
          </button>
        </div>
      </div>

      {fasting && showActiveBanner && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[380px] bg-brand-gold text-white p-4 rounded-3xl shadow-xl flex items-center justify-between z-50 animate-in slide-in-from-bottom-4 border border-brand-gold-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white animate-pulse shrink-0">⏳</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">
                {isPaused ? 'Jejum Pausado' : 'Jejum Ativo'}
              </p>
              <p className="text-xs font-medium text-white/90">
                Protocolo {user?.protocol || '16h'} • Faltam <span className="font-bold tabular-nums text-white">{formatTime(Math.max(0, targetSeconds - seconds))}</span>
              </p>
            </div>
          </div>
          <button onClick={() => setShowActiveBanner(false)} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors shrink-0 ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </>
  );
};

export default FastingTimer;
