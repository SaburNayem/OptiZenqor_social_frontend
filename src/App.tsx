import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { useSocialApp } from './hooks/useSocialApp';
import { useTheme } from './hooks/useTheme';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { JobsPage } from './pages/JobsPage';
import { EventsPage } from './pages/EventsPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { PagesDirectoryPage } from './pages/PagesDirectoryPage';
import { CallsPage } from './pages/CallsPage';
import { LiveStreamsPage } from './pages/LiveStreamsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MessagesPage } from './pages/MessagesPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AppOutletContext } from './types';

function RequireSession({ context }: { context: AppOutletContext }) {
  if (!context.app.session?.accessToken) {
    return <Navigate to="/auth/login" replace />;
  }

  return <AppLayout context={context} />;
}

function App() {
  const app = useSocialApp();
  const theme = useTheme();

  const context: AppOutletContext = {
    app,
    theme,
  };

  return (
    <HashRouter>
      <Routes>
        <Route element={<AuthLayout context={context} />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<RequireSession context={context} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/pages" element={<PagesDirectoryPage />} />
          <Route path="/calls" element={<CallsPage />} />
          <Route path="/live-streams" element={<LiveStreamsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
