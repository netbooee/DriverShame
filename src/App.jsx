import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import { isDemo } from './demo';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import ReportFlow from './pages/ReportFlow';
import Reports from './pages/Reports';

const DEMO_SESSION = { user: { email: 'demo@example.com' } };

function AuthGuard({ session, children }) {
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function Layout({ session, children }) {
  const location = useLocation();
  const hideNav = location.pathname === '/login' || location.pathname === '/auth/callback';
  return (
    <div className="flex flex-col h-full">
      {session && !hideNav && <NavBar />}
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    if (isDemo()) {
      setSession(DEMO_SESSION);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-lg">
        Loading…
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            <Layout session={session}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                  path="/report"
                  element={
                    <AuthGuard session={session}>
                      <ReportFlow />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <AuthGuard session={session}>
                      <Reports />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/"
                  element={<Navigate to={session ? '/report' : '/login'} replace />}
                />
                <Route
                  path="*"
                  element={<Navigate to={session ? '/report' : '/login'} replace />}
                />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
