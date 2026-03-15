import React, { useState } from 'react';

const MODULES = [
  {
    id: 1,
    title: 'Módulo 1: Fundamentos',
    description: 'Tudo o que você precisa saber para começar sem erros.',
    lessons: [
      { id: 101, title: 'Comece por aqui', duration: '05:20', type: 'video', completed: true },
      { id: 102, title: 'O Método do Jejum', duration: '12:45', type: 'video', completed: false },
      { id: 103, title: 'Os 5 Maiores Erros', duration: '08:15', type: 'video', completed: false },
    ]
  },
  {
    id: 2,
    title: 'Módulo 2: Nutrição Inteligente',
    description: 'O que comer na janela de alimentação.',
    lessons: [
      { id: 201, title: 'A Arte de Quebrar o Jejum', duration: '15:30', type: 'video', completed: false },
      { id: 202, title: 'Arsenal de Lanches & Chás', duration: '10:10', type: 'video', completed: false },
    ]
  },
  {
    id: 3,
    title: 'Módulo 3: SOS Vida Real',
    description: 'Como manter o foco nos momentos difíceis.',
    lessons: [
      { id: 301, title: 'Finais de Semana & Festas', duration: '09:45', type: 'video', completed: false },
      { id: 302, title: 'TPM & Fome Emocional', duration: '14:20', type: 'video', completed: false },
    ]
  }
];

const Mindset: React.FC = () => {
  const [activeModule, setActiveModule] = useState<number | null>(1);
  const [activeLesson, setActiveLesson] = useState(MODULES[0].lessons[0]);
  const [showSOS, setShowSOS] = useState(false);
  const [breathePhase, setBreathePhase] = useState<'Inspirar' | 'Segurar' | 'Expirar'>('Inspirar');

  // Simulação simples de respiração para o SOS
  const startBreathing = () => {
    let step = 0;
    const phases: ('Inspirar' | 'Segurar' | 'Expirar')[] = ['Inspirar', 'Segurar', 'Expirar', 'Segurar'];
    
    const interval = setInterval(() => {
      step = (step + 1) % 4;
      setBreathePhase(phases[step]);
    }, 4000); // Muda a cada 4 segundos (Box Breathing)

    setTimeout(() => {
      clearInterval(interval);
      setShowSOS(false);
      alert("Muito bem! A vontade de comer costuma passar após 15 minutos. Beba um copo de água e mantenha o foco. Você consegue! 💪");
    }, 24000); // Dura 24 segundos (1 ciclo e meio)
  };

  if (showSOS) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <h2 className="text-3xl font-black text-white mb-2 text-center">SOS Fome Emocional</h2>
        <p className="text-slate-400 text-center mb-12 max-w-xs">A fome passa. O arrependimento fica. Respire comigo por 1 minuto.</p>
        
        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
          <div className={`absolute inset-0 bg-emerald-500 rounded-full opacity-20 transition-all duration-[4000ms] ease-in-out ${breathePhase === 'Inspirar' ? 'scale-150' : breathePhase === 'Expirar' ? 'scale-75' : 'scale-110'}`}></div>
          <div className={`absolute inset-4 bg-emerald-400 rounded-full opacity-40 transition-all duration-[4000ms] ease-in-out ${breathePhase === 'Inspirar' ? 'scale-125' : breathePhase === 'Expirar' ? 'scale-90' : 'scale-100'}`}></div>
          <div className="relative z-10 w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50">
            <span className="text-white font-black text-2xl uppercase tracking-widest">{breathePhase}</span>
          </div>
        </div>

        <button 
          onClick={() => setShowSOS(false)}
          className="text-slate-400 font-bold text-sm hover:text-white transition-colors"
        >
          Sair do modo SOS
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">Aulas & Mentalidade</h2>
          <p className="text-sm text-slate-500">Aprenda o método e vença a mente.</p>
        </div>
        <button 
          onClick={() => {
            setShowSOS(true);
            startBreathing();
          }}
          className="bg-red-100 text-red-700 p-3 rounded-2xl shadow-sm active:scale-95 transition-transform hover:bg-red-200 flex items-center gap-2 font-bold text-xs"
        >
          <span className="text-lg">🚨</span> SOS Fome
        </button>
      </header>

      {/* Video Player Area (Placeholder for Kiwify iframe) */}
      <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-xl shadow-slate-900/10 border border-slate-800">
        <div className="aspect-video bg-black relative group flex items-center justify-center">
          {/* Placeholder for actual Kiwify embed */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10 pointer-events-none"></div>
          <img 
            src={`https://picsum.photos/seed/${activeLesson.id}/800/450`} 
            alt="Video Thumbnail" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <button className="relative z-20 w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z" /></svg>
          </button>
          
          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
            <div>
              <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 inline-block">Aula Atual</span>
              <h3 className="text-white font-bold text-lg leading-tight">{activeLesson.title}</h3>
            </div>
            <span className="text-slate-300 text-xs font-medium bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">{activeLesson.duration}</span>
          </div>
        </div>
        <div className="p-4 bg-slate-800 flex justify-between items-center">
          <p className="text-xs text-slate-400 font-medium">As aulas originais estão hospedadas na Kiwify.</p>
          <button className="text-emerald-400 text-xs font-bold flex items-center gap-1 hover:text-emerald-300">
            Marcar como concluída <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 px-1">Trilha de Conhecimento</h3>
        
        {MODULES.map((module) => (
          <div key={module.id} className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden transition-all">
            <button 
              onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{module.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{module.description}</p>
              </div>
              <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 transition-transform ${activeModule === module.id ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </button>
            
            {activeModule === module.id && (
              <div className="border-t border-slate-50 bg-slate-50/50 p-2">
                {module.lessons.map((lesson) => (
                  <button 
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${activeLesson.id === lesson.id ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${lesson.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        {lesson.completed ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z" /></svg>
                        )}
                      </div>
                      <span className={`text-sm font-medium text-left ${activeLesson.id === lesson.id ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {lesson.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{lesson.duration}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mindset;
