import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  updateUser: (updates: Partial<AppUser>) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  updateUser: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const logout = async () => {
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
