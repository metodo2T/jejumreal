
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Lives: React.FC = () => {
  const navigate = useNavigate();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  const scheduleNotification = (title: string, time: string) => {
    if (notificationPermission !== 'granted') {
      requestPermission();
      return;
    }

    // Em uma aplicação real, isso seria agendado via servidor (Push API).
    // Aqui simulamos o agendamento local para demonstração imediata.
    alert(`Lembrete ativado para: ${title} às ${time}!`);

    // Simulação de notificação disparada após 5 segundos para teste do usuário
    setTimeout(() => {
      const notification = new Notification("Live Facilitando Jejum", {
        body: `Começando agora: ${title}. Clique para entrar!`,
        icon: "/favicon.ico", // Placeholder
        badge: "/favicon.ico",
      });

      notification.onclick = () => {
        window.focus();
        navigate('/lives');
      };
    }, 5000);
  };

  const upcomingLives: any[] = [];
  const pastReplays: any[] = [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-gold-light tracking-tight">Lives Semanais</h2>
          <p className="text-brand-text/70 text-sm mt-1">Conecte-se ao vivo com nossos especialistas via Zoom.</p>
        </div>
        {notificationPermission !== 'granted' && (
          <button
            onClick={requestPermission}
            className="p-2.5 bg-brand-gold/10 text-brand-gold rounded-full hover:bg-brand-gold/20 hover:text-brand-gold-light border border-brand-gold/20 shadow-sm transition-all active:scale-95"
            title="Ativar Notificações"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        )}
      </header>

      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-brand-text/50 uppercase tracking-widest px-1 flex items-center gap-2 mb-2">
          <span>📅</span> Próximos Encontros
        </h3>
        {upcomingLives.length === 0 ? (
          <div className="bg-brand-card rounded-[32px] p-8 text-center border border-white/5 shadow-lg shadow-black/20">
            <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-brand-gold/10 shadow-inner">
              😴
            </div>
            <h4 className="text-brand-gold-light font-bold mb-2">Nenhuma live programada</h4>
            <p className="text-xs text-brand-text/60 font-medium">Fique de olho! Avisaremos aqui e via notificação quando a próxima live for agendada.</p>
          </div>
        ) : (
          upcomingLives.map((live) => (
            <div key={live.id} className={`relative bg-brand-card border ${live.isLive ? 'border-brand-gold ring-1 ring-brand-gold shadow-brand-gold/10' : 'border-white/5'} rounded-[32px] p-6 shadow-lg shadow-black/20 group`}>
              {live.isLive && (
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-red-950/40 px-3 py-1.5 rounded-full border border-red-500/30">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-none mt-0.5">Ao Vivo</span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-[11px] font-black text-brand-gold uppercase tracking-widest mb-2 flex items-center gap-1.5"><span className="opacity-80">⏰</span> {live.date} às {live.time}</p>
                <h4 className="text-xl font-bold text-brand-gold-light leading-tight pr-12 tracking-tight">{live.title}</h4>
                <p className="text-xs text-brand-text/60 mt-2.5 flex items-center gap-1.5 font-medium">
                  <svg className="w-3.5 h-3.5 text-brand-text/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {live.host}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button className="w-full bg-[#2D8CFF] hover:bg-[#236ecc] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98]">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Zoom_Video_Communications_logo.svg" className="h-4 invert brightness-0 opacity-90" alt="Zoom" />
                  <span className="mt-0.5">Entrar via Zoom</span>
                </button>
                <button
                  onClick={() => scheduleNotification(live.title, live.time)}
                  className="w-full bg-brand-dark/50 hover:bg-brand-dark hover:border-brand-gold/30 text-brand-text/90 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 text-brand-gold opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="mt-0.5 text-brand-text/60">Lembrar-me desta Live</span>
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-4 pt-4">
        <div className="flex justify-between items-center px-1 border-b border-white/5 pb-2">
          <h3 className="text-[10px] font-black text-brand-text/50 uppercase tracking-widest flex items-center gap-2">
            <span>📚</span> Biblioteca de Replays
          </h3>
          <button onClick={() => alert("Em breve: Galeria completa!")} className="text-brand-gold text-[10px] font-black uppercase tracking-widest hover:text-brand-gold-light hover:underline transition-all">Ver todos</button>
        </div>

        {pastReplays.length === 0 ? (
          <div className="bg-brand-card rounded-[32px] p-8 text-center border border-white/5 shadow-lg shadow-black/20">
            <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-brand-gold/10 shadow-inner">
              🗂️
            </div>
            <h4 className="text-brand-gold-light font-bold mb-2">Nenhum replay disponível</h4>
            <p className="text-xs text-brand-text/60 font-medium">As gravações das lives aparecerão aqui quando finalizadas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {pastReplays.map((replay) => (
              <div key={replay.id} className="bg-brand-card rounded-[24px] border border-white/5 overflow-hidden shadow-lg shadow-black/20 group cursor-pointer active:scale-[0.98] transition-transform">
                <div className="aspect-video bg-brand-dark flex items-center justify-center text-3xl group-hover:bg-brand-gold/10 border-b border-white/5 transition-colors relative">
                  <span className="group-hover:scale-110 transition-transform">{replay.thumb}</span>
                  <div className="absolute bg-brand-dark/60 backdrop-blur-sm inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 text-brand-gold shadow-sm" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  </div>
                </div>
                <div className="p-4">
                  <h5 className="text-[11px] font-bold text-brand-text leading-tight group-hover:text-brand-gold-light transition-colors">{replay.title}</h5>
                  <p className="text-[9px] text-brand-text/50 mt-1.5 font-black uppercase tracking-widest">{replay.duration}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="bg-brand-dark border border-brand-gold/20 text-brand-text/90 p-8 rounded-[32px] shadow-2xl shadow-black/40 relative overflow-hidden mt-8">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 opacity-50"></div>
        <div className="relative z-10">
          <h4 className="font-extrabold text-brand-gold-light text-lg mb-1 tracking-tight">Dúvida para a live?</h4>
          <p className="text-xs text-brand-text/60 mb-6 font-medium leading-relaxed">Envie sua pergunta antecipadamente para que o mentor responda ao vivo.</p>
          <button onClick={() => alert("Formulário será aberto nas vésperas das lives!")} className="bg-brand-gold text-brand-dark px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:shadow-brand-gold/20 hover:bg-brand-gold-light transition-all active:scale-[0.98]">
            Enviar Pergunta
          </button>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-5">
          <svg className="w-40 h-40 text-brand-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.1 21.9l4.899-1.238C8.47 21.513 10.179 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" /></svg>
        </div>
      </div>
    </div>
  );
};

export default Lives;
