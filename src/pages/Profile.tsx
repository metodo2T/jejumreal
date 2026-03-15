import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { AppUser } from '../types';
import { compressImage } from '../lib/imageUtils';

interface ProfileProps {
  user: AppUser | null;
  onLogout: () => void;
  updateUser?: (updates: Partial<AppUser>) => void;
}

const BADGES = [
  { id: 1, icon: '🔥', name: '7 Dias Invictos', desc: 'Completou 7 dias seguidos de jejum.', unlocked: true },
  { id: 2, icon: '💧', name: 'Mestre da Água', desc: 'Atingiu a meta de água por 3 dias seguidos.', unlocked: true },
  { id: 3, icon: '📉', name: 'Primeiro Kilo', desc: 'Registrou a primeira perda de peso.', unlocked: true },
  { id: 4, icon: '🧠', name: 'Mente Forte', desc: 'Usou o SOS Fome e não quebrou o jejum.', unlocked: false },
  { id: 5, icon: '🏆', name: 'Veterano (30d)', desc: 'Completou 30 dias no aplicativo.', unlocked: false },
  { id: 6, icon: '📸', name: 'Inspiração', desc: 'Postou a primeira foto no Mural de Vitórias.', unlocked: false },
];

const Profile: React.FC<ProfileProps> = ({ user, onLogout, updateUser }) => {
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(user?.protocol || '16h');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Dynamic Badges Data
  const [badges, setBadges] = useState(BADGES);

  React.useEffect(() => {
    // Calcular dinamicamente as conquistas baseadas nos dados do LocalStorage
    const updatedBadges = [...BADGES];

    // 1. 7 Dias Invictos (fastingHistoryLocal >= 7 completados recentemente)
    const fastingHistoryStr = localStorage.getItem('fastingHistoryLocal');
    if (fastingHistoryStr) {
      const fastingHistory = JSON.parse(fastingHistoryStr);
      const completedFasts = fastingHistory.filter((h: any) => h.completed).length;
      if (completedFasts >= 7) {
        updatedBadges[0].unlocked = true;
      } else {
        updatedBadges[0].unlocked = false;
      }
    } else {
      updatedBadges[0].unlocked = false;
    }

    // 2. Mestre da Água (waterStreak >= 3)
    const waterStreakStr = localStorage.getItem('waterStreak');
    if (waterStreakStr) {
      const streak = parseInt(waterStreakStr, 10);
      updatedBadges[1].unlocked = streak >= 3;
    } else {
      updatedBadges[1].unlocked = false;
    }

    // 3. Primeiro Kilo (progressHistory delta >= 1)
    const progressHistoryStr = localStorage.getItem('progressHistory');
    if (progressHistoryStr) {
      const progressHistory = JSON.parse(progressHistoryStr);
      if (progressHistory.length >= 2) {
        // Peso inicial - peso atual >= 1kg
        const initialWeight = progressHistory[0].weight;
        const currentWeight = progressHistory[progressHistory.length - 1].weight;
        updatedBadges[2].unlocked = (initialWeight - currentWeight) >= 1;
      } else {
        updatedBadges[2].unlocked = false;
      }
    } else {
      updatedBadges[2].unlocked = false;
    }

    setBadges(updatedBadges);
  }, []);

  // Nível calculado com base nas medalhas desbloqueadas
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const level = unlockedCount < 2 ? 'Iniciante' : unlockedCount < 5 ? 'Focado' : 'Mestre do Jejum';
  const progressToNext = (unlockedCount / badges.length) * 100;

  const handleSaveProtocol = async () => {
    if (user?.id) {
      try {
        await supabase
          .from('users')
          .update({ meta_jejum_atual: parseInt(selectedProtocol, 10) })
          .eq('id', user.id);
        if (updateUser) {
          updateUser({ protocol: `${parseInt(selectedProtocol, 10)}h` });
        }
      } catch (e) {
        console.warn('Erro ao atualizar protocolo:', e);
      }
    }
    setShowProtocolModal(false);
    alert(`Protocolo atualizado para ${selectedProtocol}! O novo timer já está configurado na Home.`);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user?.id) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB antes da compressão.');
        return;
      }

      setIsUploading(true);
      try {
        const compressedBase64 = await compressImage(file, 200); // 200KB max
        
        // Save to localStorage as a reliable fallback
        localStorage.setItem('userPhotoURL', compressedBase64);

        await supabase
          .from('users')
          .update({ photoURL: compressedBase64 })
          .eq('id', user.id);
          
        if (updateUser) {
          updateUser({ photoURL: compressedBase64 });
        }
      } catch (error) {
        console.error("Erro ao salvar foto no perfil:", error);
        alert("Erro ao processar e salvar a foto de perfil.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Format member Since date dynamically
  const memberSinceFormatted = user?.memberSince 
    ? new Date(user.memberSince).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '')
    : 'Jan 2026'; // Fallback

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col items-center pt-4">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-28 h-28 bg-brand-dark rounded-[32px] flex items-center justify-center text-brand-gold text-4xl font-black shadow-xl shadow-black/40 mb-4 border border-brand-gold/30 relative overflow-hidden group ${isUploading ? 'opacity-50' : ''}`}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Minha Foto" className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0]
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold uppercase tracking-widest">Mudar Foto</span>
            </div>
          </button>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-dark text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md whitespace-nowrap border border-brand-gold-light z-10">
            Nível: {level}
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-brand-gold-light mt-3 tracking-tight">{user?.name}</h2>
        <p className="text-xs text-brand-text/70 font-medium uppercase tracking-wider mt-1">Aluno Premium • Desde {memberSinceFormatted}</p>
      </header>

      {/* Barra de Progresso do Nível */}
      <div className="bg-brand-card p-6 rounded-[32px] border border-white/5 shadow-lg shadow-black/20">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h3 className="font-bold text-brand-gold-light text-sm">Sua Jornada</h3>
            <p className="text-[10px] text-brand-text/60 font-medium uppercase tracking-widest mt-0.5">{unlockedCount} de {BADGES.length} conquistas</p>
          </div>
          <span className="text-brand-gold font-black text-xl">{Math.round(progressToNext)}%</span>
        </div>
        <div className="w-full bg-brand-dark rounded-full h-3 overflow-hidden border border-white/5">
          <div
            className="bg-brand-gold h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${progressToNext}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Galeria de Conquistas (Badges) */}
      <section>
        <h3 className="text-xs font-bold text-brand-text/50 uppercase tracking-widest ml-1 mb-4 flex items-center gap-2">
          <span>🏆</span> Mural de Conquistas
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center text-center p-3.5 rounded-[24px] border ${badge.unlocked ? 'bg-brand-gold/10 border-brand-gold/20 shadow-inner' : 'bg-brand-dark/50 border-white/5 opacity-50 grayscale'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 ${badge.unlocked ? 'bg-brand-dark shadow-md border border-brand-gold/20' : 'bg-brand-card border border-white/5'}`}>
                {badge.icon}
              </div>
              <h4 className={`text-[10px] font-bold leading-tight ${badge.unlocked ? 'text-brand-gold-light' : 'text-brand-text/50'}`}>{badge.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Configurações */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-brand-text/50 uppercase tracking-widest ml-1 mb-3 mt-8 flex items-center gap-2">
          <span>⚙️</span> Ajustes do Método
        </h3>

        <button
          onClick={() => setShowProtocolModal(true)}
          className="w-full bg-brand-card border border-white/5 p-5 rounded-[24px] flex items-center justify-between hover:border-brand-gold/30 hover:bg-brand-dark/50 transition-all shadow-lg shadow-black/20 text-left group active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center text-brand-gold text-xl group-hover:bg-brand-gold/10 transition-colors border border-white/5 shadow-inner">
              ⏱️
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-gold-light">Meu Protocolo Atual</h4>
              <p className="text-[10px] text-brand-text/80 font-bold uppercase mt-1 tracking-widest">Jejum de {selectedProtocol}</p>
            </div>
          </div>
          <div className="text-brand-text/40 group-hover:text-brand-gold transition-colors bg-brand-dark/50 p-2.5 rounded-xl border border-white/5">
            <span className="text-xs font-bold uppercase tracking-widest">Alterar</span>
          </div>
        </button>

        <ProfileLink label="Dados Pessoais" icon="👤" />
        <ProfileLink label="Notificações e Lembretes" icon="🔔" />
        <ProfileLink label="Falar com Suporte" icon="💬" />
      </section>

      <button
        onClick={onLogout}
        className="w-full bg-red-950/30 text-red-400 font-black uppercase tracking-widest py-4 rounded-2xl border border-red-500/20 transition-all hover:bg-red-900/40 hover:text-red-300 mt-10 active:scale-[0.98]"
      >
        Sair da Conta
      </button>

      <div className="text-center opacity-30 mt-8">
        <p className="text-[9px] font-black uppercase tracking-widest text-brand-text">Versão 3.0.0 (Dark Mode)</p>
      </div>

      {/* Modal de Alteração de Protocolo */}
      {showProtocolModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end justify-center sm:items-center animate-in fade-in duration-300">
          <div className="bg-brand-dark w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 animate-in slide-in-from-bottom-8 border border-white/10 shadow-2xl">
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 sm:hidden"></div>
            <h3 className="text-2xl font-black text-brand-gold-light mb-2 tracking-tight">Mudar Protocolo</h3>
            <p className="text-xs text-brand-text/70 mb-8 leading-relaxed font-medium">Seu corpo se acostumou? Aumente a janela de jejum para voltar a queimar gordura.</p>

            <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {['12h', '14h', '16h', '18h', '20h', '24h'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedProtocol(p)}
                  className={`w-full p-4 rounded-[20px] border flex items-center justify-between transition-all active:scale-[0.98] ${selectedProtocol === p ? 'border-brand-gold bg-brand-gold/10' : 'border-white/5 bg-brand-card hover:border-brand-gold/30 hover:bg-brand-card/80'}`}
                >
                  <span className={`font-bold ${selectedProtocol === p ? 'text-brand-gold' : 'text-brand-text/90'}`}>Jejum de {p}</span>
                  {selectedProtocol === p && (
                    <div className="w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center text-brand-dark shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowProtocolModal(false)}
                className="flex-1 py-4 font-black uppercase tracking-widest text-[11px] text-brand-text/60 bg-brand-card border border-white/5 rounded-2xl hover:bg-white/5 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProtocol}
                className="flex-1 py-4 font-black uppercase tracking-widest text-[11px] text-brand-dark bg-brand-gold border border-brand-gold rounded-2xl hover:bg-brand-gold-light transition-all shadow-lg hover:shadow-brand-gold/20 active:scale-[0.98]"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileLink: React.FC<{ label: string; icon: string }> = ({ label, icon }) => (
  <div onClick={() => alert("Funcionalidade em desenvolvimento!")} className="bg-brand-card border border-white/5 p-4 rounded-[24px] flex items-center justify-between cursor-pointer hover:border-brand-gold/30 hover:bg-brand-dark/50 transition-all shadow-sm group active:scale-[0.98]">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-brand-dark border border-white/5 shadow-inner group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="text-sm font-bold text-brand-text/90 group-hover:text-brand-gold-light transition-colors">{label}</h4>
    </div>
    <div className="text-brand-text/30 group-hover:text-brand-gold transition-colors bg-brand-dark/50 p-2.5 rounded-xl border border-white/5">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
);

export default Profile;
