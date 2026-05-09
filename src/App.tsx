import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { useSocialApp } from './hooks/useSocialApp';
import { useTheme } from './hooks/useTheme';
import { HomePage } from './pages/HomePage';
import { ReelsPage } from './pages/ReelsPage';
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
import {
  AccountSwitchingPage,
  ActivitySessionsPage,
  ArchiveCenterPage,
  BlockedUsersPage,
  BookmarksPage,
  CreatorToolsPage,
  DraftsPage,
  GroupChatPage,
  GroupsPage,
  InviteReferralPage,
  PremiumMembershipPage,
  SavedCollectionsPage,
  SchedulingPage,
  SubscriptionsPage,
  SupportHelpPage,
  UploadManagerPage,
  VerificationRequestPage,
  WalletPaymentsPage,
} from './pages/AppParityPages';
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
          <Route path="/reels" element={<ReelsPage />} />
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
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/saved-collections" element={<SavedCollectionsPage />} />
          <Route path="/drafts" element={<DraftsPage />} />
          <Route path="/scheduling" element={<SchedulingPage />} />
          <Route path="/upload-manager" element={<UploadManagerPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/group-chat" element={<GroupChatPage />} />
          <Route path="/creator-tools" element={<CreatorToolsPage />} />
          <Route path="/wallet" element={<WalletPaymentsPage />} />
          <Route path="/premium" element={<PremiumMembershipPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/support" element={<SupportHelpPage />} />
          <Route path="/verification" element={<VerificationRequestPage />} />
          <Route path="/activity-sessions" element={<ActivitySessionsPage />} />
          <Route path="/account-switching" element={<AccountSwitchingPage />} />
          <Route path="/blocked-users" element={<BlockedUsersPage />} />
          <Route path="/invite-referral" element={<InviteReferralPage />} />
          <Route path="/archive" element={<ArchiveCenterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
