import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AppUser } from '../types';

interface HomeProps {
  user: AppUser | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [fasting, setFasting] = useState(false);
  const [fastingStart, setFastingStart] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showActiveBanner, setShowActiveBanner] = useState(true);
  const [waterGlasses, setWaterGlasses] = useState(() => {
    const saved = localStorage.getItem('waterGlasses');
    const savedDate = localStorage.getItem('waterDate');
    const today = new Date().toDateString();
    if (savedDate === today && saved) {
      return parseInt(saved, 10);
    }
    return 0;
  });
  const [localHistory, setLocalHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('fastingHistoryLocal');
    return saved ? JSON.parse(saved) : [];
  });
  const streakDays = 12; // To be updated later with real data

  const [waterNotificationsEnabled, setWaterNotificationsEnabled] = useState(() => {
    return localStorage.getItem('waterNotifications') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('waterGlasses', waterGlasses.toString());
    const savedDate = localStorage.getItem('waterDate');
    const today = new Date().toDateString();

    if (savedDate !== today) {
      localStorage.setItem('waterDate', today);
    }
    
    // Water Streak logic (assumindo 8 copos = 2L como meta base)
    if (waterGlasses === 8) {
      const lastStreakDate = localStorage.getItem('waterStreakDate');
      if (lastStreakDate !== today) {
        const currentStreak = parseInt(localStorage.getItem('waterStreak') || '0', 10);
        localStorage.setItem('waterStreak', (currentStreak + 1).toString());
        localStorage.setItem('waterStreakDate', today);
      }
    }
  }, [waterGlasses]);

  // Fetch active session from Firestore
  useEffect(() => {
    if (!user?.id) return;

    const fetchActiveSession = async () => {
      // Priorizar leitura e setup do localStorage IMEDIATAMENTE antes do fetch lento
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

        // Add a timeout to prevent hanging if offline
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Supabase timeout')), 3000)
        );

        const response = await Promise.race([snapshotPromise, timeoutPromise]) as any;
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
          // Só resetara o estado inteiro se de fato não houver sessão E o local discordar
          if (!localFasting) {
            setFasting(false);
            setFastingStart(null);
            setSessionId(null);
            setIsPaused(false);
          }
        }
      } catch (error) {
        console.warn("Aviso ao buscar sessão ativa (usando fallback local):", error);
        // Fallback to local storage if Firestore fails
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
          }
        } else {
          setFasting(false);
          setFastingStart(null);
          setIsPaused(false);
        }
      }
    };

    fetchActiveSession();
  }, [user?.id]);

  // Timer interval
  useEffect(() => {
    let interval: any;
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
      // Checagem de segurança pra não resetar ao montar o componente
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
    if (fasting) {
      setShowActiveBanner(true);
    }
  }, [fasting]);

  useEffect(() => {
    if (fasting) {
      const targetHours = parseInt(user?.protocol || '16', 10);
      const targetSeconds = targetHours * 3600;
      const remaining = Math.max(0, targetSeconds - seconds);
      const h = Math.floor(remaining / 3600).toString().padStart(2, '0');
      const m = Math.floor((remaining % 3600) / 60).toString().padStart(2, '0');
      document.title = `⏳ ${h}:${m} - Jejum Ativo`;
    } else {
      document.title = 'Jejum App';
    }

    return () => {
      document.title = 'Jejum App';
    };
  }, [fasting, seconds, user?.protocol]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === 'default') {
      const timer = setTimeout(() => setShowNotificationPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      await Notification.requestPermission();
      setShowNotificationPrompt(false);
    }
  };

  const toggleWaterNotifications = async () => {
    if (!waterNotificationsEnabled) {
      if ("Notification" in window) {
        let perm = Notification.permission;
        if (perm === 'default') {
          perm = await Notification.requestPermission();
        }
        if (perm === 'granted') {
          setWaterNotificationsEnabled(true);
          localStorage.setItem('waterNotifications', 'true');
          new Notification("Lembretes ativados! 💧", {
            body: "Você receberá um aviso a cada hora durante sua janela de alimentação."
          });
        } else {
          alert('Permissão para notificações negada. Ative nas configurações do navegador.');
        }
      } else {
        alert('Seu navegador não suporta notificações.');
      }
    } else {
      setWaterNotificationsEnabled(false);
      localStorage.setItem('waterNotifications', 'false');
    }
  };

  useEffect(() => {
    let waterInterval: any;
    if (!fasting && waterNotificationsEnabled && "Notification" in window && Notification.permission === 'granted') {
      waterInterval = setInterval(() => {
        new Notification("Hora de se hidratar! 💧", {
          body: "Beba um copo de água para manter seu metabolismo ativo."
        });
      }, 3600 * 1000);
    }
    return () => clearInterval(waterInterval);
  }, [fasting, waterNotificationsEnabled]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getBodyPhase = (totalSeconds: number) => {
    const hours = totalSeconds / 3600;
    if (hours < 4) return "Açúcar no sangue normalizando";
    if (hours < 8) return "Digestão finalizada";
    if (hours < 12) return "Iniciando queima de gordura";
    if (hours < 16) return "Queima de gordura acelerada";
    return "Autofagia (Renovação celular)";
  };

  // Fetch history from Supabase for cross-device sync
  useEffect(() => {
    if (!user?.id) return;

    const fetchHistory = async () => {
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
          // Atualiza também o cache local
          localStorage.setItem('fastingHistoryLocal', JSON.stringify(formattedHistory));
        }
      } catch (err) {
        console.warn("Aviso ao buscar histórico do Supabase:", err);
      }
    };

    fetchHistory();
  }, [user?.id]);

  const targetHours = parseInt(user?.protocol || '16', 10);
  const targetSeconds = targetHours * 3600;
  const progress = Math.min(seconds / targetSeconds, 1);

  const [targetReached, setTargetReached] = useState(() => {
    return localStorage.getItem('targetReached') === 'true';
  });

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

      // Update running session if it exists
      if (sessionId) {
        try {
          supabase
            .from('fasting_sessions')
            .update({
              status: 'completed',
              end_time: new Date().toISOString(),
              duration_hours: seconds / 3600,
              completed_percentage: progress * 100,
              metabolic_phase: getBodyPhase(seconds)
            })
            .eq('id', sessionId).then();
        } catch (error) {
          console.warn("Aviso ao encerrar sessão no Supabase:", error);
        }
        setSessionId(null);
      }

      // Always save to history for every test
      try {
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
          protocol: user?.protocol || '16h',
          completed_percentage: progress * 100,
          metabolic_phase: getBodyPhase(seconds)
        };

        const localEntry = {
          id: Date.now().toString(),
          date: startDateStr === endDateStr ? startDateStr : `${startDateStr} - ${endDateStr}`,
          start: startTimeStr,
          end: endTimeStr,
          duration: formatTime(Math.floor(seconds)),
          protocol: user?.protocol || '16h',
          completed: seconds >= targetSeconds
        };

        const newLocalHistory = [localEntry, ...localHistory].slice(0, 5); // Keep last 5 locally
        setLocalHistory(newLocalHistory);
        localStorage.setItem('fastingHistoryLocal', JSON.stringify(newLocalHistory));

        await supabase.from('fasting_history').insert([historyEntry]);
      } catch (historyErr) {
        console.warn("Aviso ao salvar histórico:", historyErr);
      }
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

      try {
        const addPromise = supabase
          .from('fasting_sessions')
          .insert([{
            user_id: user.id,
            start_time: new Date().toISOString(),
            protocol_type: user.protocol || '16h',
            status: 'active'
          }])
          .select()
          .single();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
        const response = await Promise.race([addPromise, timeoutPromise]) as any;
        if (response?.data) setSessionId(response.data.id);
      } catch (error) {
        console.warn("Aviso ao iniciar sessão no Firestore:", error);
      }
    }
  };

  const togglePause = () => {
    if (isPaused) {
      // Retomar
      const newStart = Date.now() - (seconds * 1000);
      setFastingStart(newStart);
      setIsPaused(false);
      localStorage.setItem('fastingStart', newStart.toString());
      localStorage.setItem('fastingPaused', 'false');
      if (sessionId) {
        supabase.from('fasting_sessions').update({ status: 'active', start_time: new Date(newStart).toISOString(), end_time: null }).eq('id', sessionId).then(({ error }) => { if (error) console.warn(error); });
      }
    } else {
      // Pausar
      setIsPaused(true);
      localStorage.setItem('fastingPaused', 'true');
      localStorage.setItem('fastingSeconds', seconds.toString());
      if (sessionId) {
        supabase.from('fasting_sessions').update({ status: 'paused', end_time: new Date().toISOString() }).eq('id', sessionId).then(({ error }) => { if (error) console.warn(error); });
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <section className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-brand-gold/10 text-brand-gold text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 border border-brand-gold/20">
              🔥 {streakDays} Dias Seguidos
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-brand-text tracking-tight">Olá, {user?.name?.split(' ')[0]}</h2>
        </div>
        <Link to="/lives" className="relative h-10 w-10 bg-white rounded-2xl border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-brand-red w-2.5 h-2.5 rounded-full absolute -top-0.5 -right-0.5 border-2 border-white live-dot"></div>
          <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </Link>
      </section>

      {showNotificationPrompt && (
        <div className="bg-white p-4 rounded-3xl text-brand-text flex items-center justify-between animate-in slide-in-from-top-4 duration-500 shadow-xl border border-brand-gold/20">
          <div className="flex-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">Notificações</h4>
            <p className="text-[11px] opacity-90">Receba lembretes para beber água e quebrar o jejum!</p>
          </div>
          <button
            onClick={requestPermission}
            className="bg-brand-gold text-brand-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight shadow-md hover:bg-brand-gold-light transition-all"
          >
            Ativar
          </button>
          <button
            onClick={() => setShowNotificationPrompt(false)}
            className="ml-3 text-gray-400 hover:text-gray-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Timer Circular Estilizado */}
      <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-200 border border-gray-100 flex flex-col items-center relative overflow-hidden">
        {fasting && (
          <div className="absolute top-4 left-0 w-full text-center animate-in slide-in-from-top-2">
            <span className="bg-brand-gold/10 text-brand-gold-light text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-brand-gold/20">
              Fase: {getBodyPhase(seconds)}
            </span>
          </div>
        )}
        <div className="relative w-56 h-56 flex items-center justify-center mt-4">
          {/* Efeito de Brilho/Pulso Dinâmico */}
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
            className={`flex-1 py-5 rounded-[24px] font-bold transition-all shadow-md active:scale-95 ${fasting ? 'bg-brand-red/10 text-brand-red border border-brand-red/20 hover:bg-brand-red/20' : 'bg-brand-gold text-white shadow-brand-gold/20 hover:bg-brand-gold-light'
              }`}
          >
            {fasting ? 'Encerrar' : 'Iniciar Protocolo Agora'}
          </button>
        </div>
      </div>

      {/* Water Tracker */}
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 flex flex-col gap-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-brand-text mb-1">Hidratação</h4>
            <p className="text-xs text-gray-500">{waterGlasses * 250}ml consumidos hoje</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(Math.min(waterGlasses, 4))].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-brand-gold border-2 border-white flex items-center justify-center text-white text-xs shadow-sm">
                  💧
                </div>
              ))}
            </div>
            <button
              onClick={() => setWaterGlasses(prev => prev + 1)}
              className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 text-brand-gold hover:bg-brand-gold-light hover:text-white transition-colors active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-brand-dark p-3.5 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm border border-gray-200">
              ⏰
            </div>
            <div>
              <p className="text-xs font-bold text-brand-text">Lembrete de Água</p>
              <p className="text-[10px] text-gray-500 font-medium">A cada 1h na janela de alimentação</p>
            </div>
          </div>
          <button
            onClick={toggleWaterNotifications}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-1 focus:ring-offset-white ${waterNotificationsEnabled ? 'bg-brand-gold' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${waterNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Acesso Rápido</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <HomeCard
            to="/kit"
            title="Kit Salva-vidas"
            subtitle="Ferramentas"
            color="bg-white"
            icon="🧰"
          />
          <HomeCard
            to="/mindset"
            title="Mentalidade"
            subtitle="Planos"
            color="bg-white"
            icon="🧠"
          />
          <HomeCard
            to="/progress"
            title="Meu Progresso"
            subtitle="Evolução"
            color="bg-white"
            icon="📈"
          />
          <HomeCard
            to="/community"
            title="Comunidade"
            subtitle="Comunidade"
            color="bg-white"
            icon="🔥"
          />
        </div>
      </section>

      {/* Histórico de Jejuns Recentes */}
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

      {/* SOS Fome Button */}
      <Link to="/mindset" className="block bg-brand-red/5 rounded-[24px] p-5 border border-brand-red/20 flex items-center justify-between group shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform border border-brand-red/20 shadow-sm">
            🚨
          </div>
          <div>
            <h4 className="font-bold text-brand-red">SOS Fome Emocional</h4>
            <p className="text-xs text-brand-red/70 mt-0.5">Quase quebrando o jejum? Clique aqui.</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-brand-red/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
      </Link>

      {/* Persistent Fasting Notification Banner */}
      {fasting && showActiveBanner && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[380px] bg-brand-gold text-white p-4 rounded-3xl shadow-xl flex items-center justify-between z-50 animate-in slide-in-from-bottom-4 border border-brand-gold-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white animate-pulse shrink-0">
              ⏳
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">
                {isPaused ? 'Jejum Pausado' : 'Jejum Ativo'}
              </p>
              <p className="text-xs font-medium text-white/90">
                Protocolo {user?.protocol || '16h'} • Faltam <span className="font-bold tabular-nums text-white">{formatTime(Math.max(0, targetSeconds - seconds))}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowActiveBanner(false)}
            className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors shrink-0 ml-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

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

export default Home;