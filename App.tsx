import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import { Layout } from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';

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
const Challenges = React.lazy(() => import('./pages/Challenges'));
const Ranking = React.lazy(() => import('./pages/Ranking'));
const AdminChallenges = React.lazy(() => import('./pages/AdminChallenges'));

const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <Login />
      </React.Suspense>
    );
  }

  return (
    <HashRouter>
      <Layout>
        <React.Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/protocols" element={<ProtocolList />} />
            <Route path="/protocol/:id" element={<ProtocolDetailView />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/community" element={<Community />} />
            <Route path="/lives" element={<Lives />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/admin" element={<AdminChallenges />} />
            <Route path="/profile" element={<Profile />} />
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