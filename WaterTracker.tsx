import React, { useState, useEffect } from 'react';

const WaterTracker: React.FC = () => {
  const [waterGlasses, setWaterGlasses] = useState(() => {
    const saved = localStorage.getItem('waterGlasses');
    const savedDate = localStorage.getItem('waterDate');
    const today = new Date().toDateString();
    if (savedDate === today && saved) {
      return parseInt(saved, 10);
    }
    return 0;
  });

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
    
    if (waterGlasses === 8) {
      const lastStreakDate = localStorage.getItem('waterStreakDate');
      if (lastStreakDate !== today) {
        const currentStreak = parseInt(localStorage.getItem('waterStreak') || '0', 10);
        localStorage.setItem('waterStreak', (currentStreak + 1).toString());
        localStorage.setItem('waterStreakDate', today);
      }
    }
  }, [waterGlasses]);

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
            body: "Você receberá um aviso a cada hora para beber água."
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
    if (waterNotificationsEnabled && "Notification" in window && Notification.permission === 'granted') {
      waterInterval = setInterval(() => {
        new Notification("Hora de se hidratar! 💧", {
          body: "Beba um copo de água para manter seu corpo ativo."
        });
      }, 3600 * 1000);
    }
    return () => clearInterval(waterInterval);
  }, [waterNotificationsEnabled]);

  return (
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
            <p className="text-[10px] text-gray-500 font-medium">A cada 1h (recomendado)</p>
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
  );
};

export default WaterTracker;
