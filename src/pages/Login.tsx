
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (name: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
      } else {
        if (!name.trim()) {
          setError('Por favor, informe seu nome.');
          setLoading(false);
          return;
        }
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nome: name.trim(),
            }
          }
        });

        if (signUpError) throw signUpError;

        const user = data.user;
        if (user) {
          // Criação automática do documento no Supabase Database
          const { error: dbErr } = await supabase
            .from('users')
            .insert([
              {
                id: user.id,
                nome: name.trim(),
                email: email,
                nivel: 'Iniciante',
                badges: [],
                meta_jejum_atual: 16,
                streak_atual: 0,
                role: 'student'
              }
            ]);
            
          if (dbErr) {
            console.warn("Aviso ao criar documento do usuário:", dbErr);
          }
        }
      }
      // onAuthStateChange in App.tsx will handle the state update
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos.');
      } else if (err.message.includes('User already registered')) {
        setError('Este email já está em uso.');
      } else if (err.message.includes('rate limit exceeded')) {
        setError('Muitas tentativas! Aguarde um minuto e tente novamente.');
      } else {
        setError('Ocorreu um erro: ' + (err.message || 'Tente novamente.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-brand-card rounded-[32px] p-8 shadow-2xl shadow-black/40 border border-white/5">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-brand-dark rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-gold/20 shadow-inner overflow-hidden">
            <img src="/logo.jpg" alt="Logo Facilitando Jejum" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <h1 className="text-2xl font-black text-brand-gold-light tracking-tight">Facilitando Jejum</h1>
          <p className="text-brand-text/70 mt-2 text-sm italic">Sua jornada de saúde começa aqui.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold text-brand-gold/80 uppercase tracking-widest mb-1.5 ml-1">Seu Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como quer ser chamado?"
                className="w-full bg-brand-dark/50 px-4 py-3.5 rounded-2xl border border-white/5 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-brand-text placeholder-brand-text/30 transition-all"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-brand-gold/80 uppercase tracking-widest mb-1.5 ml-1">Email do Aluno</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-brand-dark/50 px-4 py-3.5 rounded-2xl border border-white/5 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-brand-text placeholder-brand-text/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-brand-gold/80 uppercase tracking-widest mb-1.5 ml-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full bg-brand-dark/50 px-4 py-3.5 rounded-2xl border border-white/5 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold text-brand-text placeholder-brand-text/30 transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-brand-text/40 hover:text-brand-gold transition-colors text-sm font-medium"
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs text-center font-medium bg-red-950/50 border border-red-500/20 p-3 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-brand-gold hover:bg-brand-gold-light disabled:bg-brand-dark disabled:text-brand-text/50 text-brand-dark font-black uppercase tracking-wider py-4 rounded-2xl shadow-lg hover:shadow-brand-gold/20 transition-all active:scale-[0.98] flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              isLogin ? 'Entrar' : 'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 items-center">
          {isLogin && <button className="text-brand-text/60 text-sm font-medium hover:text-brand-gold transition-colors">Esqueci minha senha</button>}
          <div className="w-full h-px bg-white/5 my-2"></div>
          <p className="text-xs text-brand-text/50">{isLogin ? 'Ainda não é aluno?' : 'Já tem uma conta?'}</p>
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-brand-gold font-bold border border-brand-gold/30 px-8 py-2.5 rounded-xl hover:bg-brand-gold/10 transition-colors w-full uppercase text-xs tracking-wider"
          >
            {isLogin ? 'Preciso de acesso' : 'Fazer login'}
          </button>
        </div>
      </div>
      <p className="mt-8 text-brand-text/40 text-[10px] text-center max-w-[280px] uppercase tracking-widest leading-relaxed">
        Acesso restrito para alunos da Mentoria Facilitando Jejum.<br />
        © 2026 Todos os direitos reservados.
      </p>
    </div>
  );
};

export default Login;
