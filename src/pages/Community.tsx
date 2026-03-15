import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/imageUtils';

interface CommunityProps {
  user: { id: string; name: string; protocol: string; photoURL?: string } | null;
}

const Community: React.FC<CommunityProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'mural' | 'mentor'>('mural');

  const [posts, setPosts] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [newPost, setNewPost] = useState('');

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setPosts(data.filter(i => i.type === 'post'));
        setQuestions(data.filter(i => i.type === 'question'));
      }
    } catch (e) {
      console.warn("Please create the `community_posts` table in Supabase.", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleDelete = async (id: string, type: 'post' | 'question') => {
    try {
      if (type === 'post') {
        setPosts(posts.filter(p => p.id !== id));
      } else {
        setQuestions(questions.filter(q => q.id !== id));
      }
      await supabase.from('community_posts').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Foto muito grande.');
        return;
      }
      try {
        const compressed = await compressImage(file, 200);
        setNewPhoto(compressed);
      } catch (err) {
        alert("Erro ao comprimir imagem.");
      }
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !newPhoto) return;
    if (!user) {
      alert("Faça login para postar");
      return;
    }

    const now = new Date();
    const formattedTime = now.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newItem = {
      author_id: user.id,
      author_name: user.name,
      author_badge: 'Aluno', // dynamic badge could be fetched
      content: newPost,
      photo: newPhoto,
      type: activeTab === 'mural' ? 'post' : 'question',
      likes: 0,
      comments: 0,
      answered: false,
      time_string: formattedTime,
    };

    setNewPost('');
    setNewPhoto(null);

    // Optimistic Update
    if (activeTab === 'mural') {
      const tempPost = { ...newItem, id: Date.now().toString(), author: 'Você', time: formattedTime, badge: 'Aluno' };
      setPosts([tempPost, ...posts]);
    } else {
      const tempQ = { ...newItem, id: Date.now().toString(), author: 'Você', time: formattedTime, upvotes: 0, answered: false };
      setQuestions([tempQ, ...questions]);
    }

    try {
      await supabase.from('community_posts').insert([newItem]);
      fetchItems();
    } catch (e) {
      console.error("Please create community_posts table", e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header>
        <h2 className="text-2xl font-extrabold text-brand-gold-light tracking-tight mb-1">Comunidade</h2>
        <p className="text-sm text-brand-text/70">Juntos somos mais fortes. Compartilhe e aprenda.</p>
      </header>

      <div className="flex bg-brand-dark/50 p-1 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveTab('mural')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all uppercase tracking-widest ${activeTab === 'mural' ? 'bg-brand-card text-brand-gold shadow-md border border-brand-gold/10' : 'text-brand-text/50 hover:text-brand-text'}`}
        >
          Mural de Vitórias
        </button>
        <button
          onClick={() => setActiveTab('mentor')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all uppercase tracking-widest ${activeTab === 'mentor' ? 'bg-brand-card text-brand-gold shadow-md border border-brand-gold/10' : 'text-brand-text/50 hover:text-brand-text'}`}
        >
          Pergunte à Mentora
        </button>
      </div>

      {/* New Post Box */}
      <div className="bg-brand-card p-5 rounded-[32px] border border-white/5 shadow-lg shadow-black/20">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder={activeTab === 'mural' ? "Compartilhe uma vitória hoje!" : "Qual a sua dúvida sobre jejum?"}
          className="w-full p-4 bg-brand-dark rounded-2xl text-sm font-medium text-brand-text placeholder-brand-text/30 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold border border-white/5 h-24 resize-none transition-all shadow-inner"
        ></textarea>
        <div className="flex justify-between items-center mt-4">
          {activeTab === 'mural' ? (
            <div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-brand-gold text-xs font-bold bg-brand-gold/10 border border-brand-gold/20 px-4 py-2.5 rounded-xl hover:bg-brand-gold/20 transition-colors uppercase tracking-widest active:scale-[0.98]"
              >
                <span className="text-lg opacity-80">📸</span> <span className="mt-0.5">Anexar Foto</span>
              </button>
            </div>
          ) : (
            <div className="text-[10px] text-brand-text/40 font-bold uppercase tracking-widest max-w-[150px] leading-relaxed">As mais votadas serão respondidas em vídeo!</div>
          )}
          <button
            onClick={handlePost}
            className="bg-brand-gold text-brand-dark px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand-gold/20 hover:bg-brand-gold-light transition-all active:scale-[0.98]"
          >
            {activeTab === 'mural' ? 'Publicar' : 'Enviar Pergunta'}
          </button>
        </div>
        {newPhoto && (
          <div className="mt-4 relative inline-block">
            <img src={newPhoto} alt="Pré-visualização" className="h-24 rounded-xl border border-white/10 shadow-lg" />
            <button
              onClick={() => setNewPhoto(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {activeTab === 'mural' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 opacity-50 text-brand-gold">Carregando mural...</div>
          ) : posts.length === 0 ? (
            <div className="bg-brand-card p-8 rounded-[32px] border border-white/5 shadow-lg text-center animate-in zoom-in-95 duration-500 shadow-black/20">
              <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-brand-gold/10 shadow-inner">
                🏜️
              </div>
              <h4 className="text-brand-gold-light font-bold mb-2">Este mural está vazio</h4>
              <p className="text-xs text-brand-text/60 font-medium">Seja o primeiro a compartilhar uma conquista hoje! Tire uma foto da sua refeição ou do seu progresso.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="relative bg-brand-card p-6 rounded-[32px] border border-white/5 shadow-lg shadow-black/20 animate-in slide-in-from-bottom-4 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-brand-dark border border-brand-gold/20 rounded-2xl flex items-center justify-center font-black text-brand-gold text-lg shadow-inner group-hover:bg-brand-gold/10 transition-colors overflow-hidden">
                    {(post.author_name || post.author || '?')[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-brand-gold-light tracking-tight">{post.author_id === user?.id ? 'Você' : post.author_name || post.author}</h4>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2.5 py-1 rounded-full">{post.author_badge || post.badge}</span>
                    </div>
                    <p className="text-[10px] text-brand-text/40 font-bold uppercase tracking-widest">{post.time_string || post.time}</p>
                  </div>
                </div>
                {(post.author_id === user?.id || post.author === 'Você') && (
                  <button
                    onClick={() => handleDelete(post.id, 'post')}
                    className="absolute top-6 right-6 text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-900/20 rounded-xl"
                  >
                    <span className="text-xl">🗑️</span>
                  </button>
                )}
                {post.content && <p className="text-sm text-brand-text/90 leading-relaxed mb-4 font-medium">{post.content}</p>}
                {post.photo && (
                  <div className="mb-5 overflow-hidden rounded-[24px] border border-white/5 shadow-lg shadow-black/30 bg-brand-dark/50 flex justify-center items-center">
                    <img src={post.photo} alt="Postagem" className="max-h-[600px] w-auto max-w-full rounded-[24px] object-contain" />
                  </div>
                )}
                <div className="flex gap-6 border-t border-white/5 pt-4">
                  <button className="flex items-center gap-2 text-brand-text/40 text-xs font-bold hover:text-brand-gold transition-colors">
                    <span className="text-lg opacity-80">🔥</span> <span className="mt-0.5">{post.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-brand-text/40 text-xs font-bold hover:text-brand-gold transition-colors">
                    <span className="text-lg opacity-80">💬</span> <span className="mt-0.5">{post.comments || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'mentor' && (
        <div className="space-y-4">
          <div className="bg-brand-gold/10 p-5 rounded-[24px] border border-brand-gold/20 flex items-start gap-4">
            <div className="text-2xl mt-0.5 opacity-90">💡</div>
            <div>
              <h4 className="font-black text-brand-gold uppercase tracking-widest text-[11px] mb-1.5">Como funciona?</h4>
              <p className="text-xs text-brand-text/80 leading-relaxed font-medium">Faça sua pergunta ou vote nas dúvidas de outros alunos. Toda semana a mentora responde as top 3 perguntas em vídeo!</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 opacity-50 text-brand-gold">Carregando perguntas...</div>
          ) : questions.length === 0 ? (
            <div className="bg-brand-card p-8 rounded-[32px] border border-white/5 shadow-lg text-center animate-in zoom-in-95 duration-500 shadow-black/20">
              <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-brand-gold/10 shadow-inner">
                🤔
              </div>
              <h4 className="text-brand-gold-light font-bold mb-2">Nenhuma dúvida por aqui</h4>
              <p className="text-xs text-brand-text/60 font-medium">Tem alguma pergunta sobre jejum que não quer calar? Essa é a sua chance!</p>
            </div>
          ) : (
            questions.map((q) => (
              <div key={q.id} className="bg-brand-card p-5 rounded-[24px] border border-white/5 shadow-lg shadow-black/20 flex gap-4 animate-in slide-in-from-bottom-4 group">
                <div className="flex flex-col items-center gap-2">
                  <button className="w-10 h-10 bg-brand-dark border border-white/5 rounded-xl flex items-center justify-center hover:bg-brand-gold/10 hover:border-brand-gold/30 hover:text-brand-gold transition-all text-brand-text/40 active:scale-[0.98] shadow-inner">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <span className="font-black text-brand-gold-light text-xs tracking-wider">{q.likes || q.upvotes || 0}</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text/50">{q.author_id === user?.id ? 'Você' : q.author_name || q.author}</span>
                    {q.answered && (
                      <span className="bg-brand-gold/20 text-brand-gold border border-brand-gold/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm overflow-hidden relative">
                        <div className="absolute inset-0 bg-white/10 w-full animate-pulse"></div>
                        ✅ Respondida
                      </span>
                    )}
                    {(q.author_id === user?.id || q.author === 'Você') && (
                      <button
                        onClick={() => handleDelete(q.id, 'question')}
                        className="text-red-400/50 hover:text-red-300 transition-colors ml-auto"
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-medium text-brand-text/90 leading-relaxed">{q.content}</p>
                  {(q.time_string || q.time) && <p className="text-[9px] mt-2 text-brand-text/30 font-bold uppercase tracking-widest">{q.time_string || q.time}</p>}
                  {q.answered && (
                    <button onClick={() => alert("Vídeo indisponível no momento!")} className="mt-4 text-[11px] font-black text-brand-gold uppercase tracking-widest flex items-center gap-1.5 hover:text-brand-gold-light hover:underline transition-colors w-max">
                      <span className="opacity-90">▶️</span> Ver resposta em vídeo
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Community;
