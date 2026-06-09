import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import Toast from './components/ui/Toast';
import useAuthStore from './store/authStore';
import { getStats } from './services/authApi';

export default function App() {
  const { token, user, setStats } = useAuthStore();

  // Load stats on app start if already logged in
  useEffect(() => {
    if (token && user) {
      getStats(token).then(res => setStats(res.stats)).catch(() => {});
    }
  }, []);

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
