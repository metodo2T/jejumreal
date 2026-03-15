import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { AppUser } from './types';

import { Layout } from './components/layout/Layout';

// Usado Suspense e React.lazy para Code Splitting: reduz o bundle inicial
const Login = React.lazy(() => import('./pages/Login'));
const Home = React.lazy(() => import('./pages/Home'));
const ProtocolList = React.lazy(() => import('./pages/ProtocolList'));
const ProtocolDetailView = React.lazy(() => import('./pages/ProtocolDetailView'));
const Progress = React.lazy(() => import('./pages/Progress'));
const Community = React.lazy(() => import('./pages/Community'));
const Lives = React.lazy(() => import('./pages/Lives'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Bonus = React.lazy(() => import('./pages/Bonus'));
const Kit = React.lazy(() => import('./pages/Kit'));
const Mindset = React.lazy(() => import('./pages/Mindset'));

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authTimeout = setTimeout(() => {
      console.warn("Auth state timeout, forcing load");
      setLoading(false);
    }, 5000);

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleAuthChange(session?.user || null);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session?.user || null);
    });

    const handleAuthChange = async (supabaseUser: any) => {
      clearTimeout(authTimeout);
      if (supabaseUser) {
        setIsAuthenticated(true);
        try {
          const { data: userDoc, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

          if (userDoc && !error) {
            setUser({
              id: supabaseUser.id,
              name: userDoc.nome || supabaseUser.user_metadata?.nome || 'Aluno',
              protocol: `${userDoc.meta_jejum_atual || 16}h`,
              photoURL: userDoc.photoURL || localStorage.getItem('userPhotoURL') || supabaseUser.user_metadata?.avatar_url || undefined,
              memberSince: supabaseUser.created_at
            });
          } else {
            setUser({
              id: supabaseUser.id,
              name: supabaseUser.user_metadata?.nome || supabaseUser.email?.split('@')[0] || 'Aluno',
              protocol: '16h',
              photoURL: localStorage.getItem('userPhotoURL') || supabaseUser.user_metadata?.avatar_url || undefined,
              memberSince: supabaseUser.created_at
            });
          }
        } catch (e) {
          console.warn("Aviso ao buscar usuário no Supabase (usando fallback):", e);
          setUser({
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.nome || supabaseUser.email?.split('@')[0] || 'Aluno',
            protocol: '16h',
            photoURL: localStorage.getItem('userPhotoURL') || supabaseUser.user_metadata?.avatar_url || undefined,
            memberSince: supabaseUser.created_at
          });
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (name: string) => {
    // Handled by onAuthStateChange
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const updateUser = (updates: Partial<AppUser>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-dark"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div></div>}>
        <Login onLogin={handleLogin} />
      </React.Suspense>
    );
  }

  return (
    <HashRouter>
      <Layout user={user}>
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-dark"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div></div>}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/protocols" element={<ProtocolList />} />
            <Route path="/protocol/:id" element={<ProtocolDetailView />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/community" element={<Community user={user} />} />
            <Route path="/lives" element={<Lives />} />
            <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} updateUser={updateUser} />} />
            <Route path="/bonus" element={<Bonus />} />
            <Route path="/kit" element={<Kit />} />
            <Route path="/mindset" element={<Mindset />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </Layout>
    </HashRouter>
  );
};

export default App;