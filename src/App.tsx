import type { ReactElement } from 'react';
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
import {
  AccessibilitySupportPage,
  AdvancedPrivacyPage,
  AppUpdateFlowPage,
  BusinessProfilePage,
  DeepLinkHandlerPage,
  ExploreRecommendationPage,
  HashtagsTrendingPage,
  HiddenPostsPage,
  LearningCoursesPage,
  LegalCompliancePage,
  LocalizationSupportPage,
  MaintenanceModePage,
  MediaViewerPage,
  NotificationDevicesPage,
  OfflineSyncPage,
  OnboardingPage,
  PaymentsPage,
  PersonalizationPage,
  PollsSurveysPage,
  PushNotificationPreferencesPage,
  RecruiterProfilePage,
  ReportCenterPage,
  SafetyPrivacyPage,
  SellerProfilePage,
  ShareRepostPage,
} from './pages/AppUtilityPages';
import { AppOutletContext } from './types';

function RequireSession({ context }: { context: AppOutletContext }) {
  if (!context.app.session?.accessToken) {
    return <Navigate to="/auth/login" replace />;
  }

  return <AppLayout context={context} />;
}

function FeatureRoute({
  context,
  featureKey,
  element,
}: {
  context: AppOutletContext;
  featureKey: string;
  element: ReactElement;
}) {
  if (context.app.isFeatureVisible(featureKey)) {
    return element;
  }

  const fallback = context.app.runtimeConfig.web.navigation.find(
    (item) =>
      item.visible &&
      item.key !== featureKey &&
      item.key !== 'stories' &&
      item.path &&
      item.path !== '/',
  );

  return fallback ? (
    <Navigate to={fallback.path} replace />
  ) : (
    <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
      This web section is currently hidden by dashboard settings.
    </div>
  );
}

function App() {
  const app = useSocialApp();
  const theme = useTheme();

  const context: AppOutletContext = {
    app,
    theme,
  };
  const feature = (featureKey: string, element: ReactElement) => (
    <FeatureRoute context={context} featureKey={featureKey} element={element} />
  );

  return (
    <HashRouter>
      <Routes>
        <Route element={<AuthLayout context={context} />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<RequireSession context={context} />}>
          <Route path="/" element={feature('home', <HomePage />)} />
          <Route path="/reels" element={feature('reels', <ReelsPage />)} />
          <Route path="/explore" element={feature('explore', <ExplorePage />)} />
          <Route path="/marketplace" element={feature('marketplace', <MarketplacePage />)} />
          <Route path="/jobs" element={feature('jobs', <JobsPage />)} />
          <Route path="/events" element={feature('events', <EventsPage />)} />
          <Route path="/communities" element={feature('communities', <CommunitiesPage />)} />
          <Route path="/pages" element={feature('pages', <PagesDirectoryPage />)} />
          <Route path="/calls" element={feature('calls', <CallsPage />)} />
          <Route path="/live-streams" element={feature('live-streams', <LiveStreamsPage />)} />
          <Route path="/notifications" element={feature('notifications', <NotificationsPage />)} />
          <Route path="/messages" element={feature('messages', <MessagesPage />)} />
          <Route path="/connections" element={feature('connections', <ConnectionsPage />)} />
          <Route path="/bookmarks" element={feature('bookmarks', <BookmarksPage />)} />
          <Route path="/saved-collections" element={feature('saved-collections', <SavedCollectionsPage />)} />
          <Route path="/drafts" element={feature('drafts', <DraftsPage />)} />
          <Route path="/scheduling" element={feature('scheduling', <SchedulingPage />)} />
          <Route path="/upload-manager" element={feature('upload-manager', <UploadManagerPage />)} />
          <Route path="/onboarding" element={feature('onboarding', <OnboardingPage />)} />
          <Route path="/personalization" element={feature('personalization-onboarding', <PersonalizationPage />)} />
          <Route path="/groups" element={feature('groups', <GroupsPage />)} />
          <Route path="/group-chat" element={feature('group-chat', <GroupChatPage />)} />
          <Route path="/creator-tools" element={feature('creator-tools', <CreatorToolsPage />)} />
          <Route path="/wallet" element={feature('wallet', <WalletPaymentsPage />)} />
          <Route path="/payments" element={feature('payments', <PaymentsPage />)} />
          <Route path="/premium" element={feature('premium', <PremiumMembershipPage />)} />
          <Route path="/subscriptions" element={feature('subscriptions', <SubscriptionsPage />)} />
          <Route path="/support" element={feature('support', <SupportHelpPage />)} />
          <Route path="/verification" element={feature('verification', <VerificationRequestPage />)} />
          <Route path="/activity-sessions" element={feature('activity-sessions', <ActivitySessionsPage />)} />
          <Route path="/account-switching" element={feature('account-switching', <AccountSwitchingPage />)} />
          <Route path="/blocked-users" element={feature('blocked-users', <BlockedUsersPage />)} />
          <Route path="/hidden-posts" element={feature('hidden-posts', <HiddenPostsPage />)} />
          <Route path="/invite-referral" element={feature('invite-referral', <InviteReferralPage />)} />
          <Route path="/archive" element={feature('archive', <ArchiveCenterPage />)} />
          <Route path="/advanced-privacy" element={feature('advanced-privacy', <AdvancedPrivacyPage />)} />
          <Route path="/safety-privacy" element={feature('safety-privacy', <SafetyPrivacyPage />)} />
          <Route path="/accessibility" element={feature('accessibility-support', <AccessibilitySupportPage />)} />
          <Route path="/localization" element={feature('localization-support', <LocalizationSupportPage />)} />
          <Route path="/legal" element={feature('legal-compliance', <LegalCompliancePage />)} />
          <Route path="/push-preferences" element={feature('push-notification-preferences', <PushNotificationPreferencesPage />)} />
          <Route path="/notification-devices" element={feature('notification-devices', <NotificationDevicesPage />)} />
          <Route path="/app-update" element={feature('app-update-flow', <AppUpdateFlowPage />)} />
          <Route path="/offline-sync" element={feature('offline-sync', <OfflineSyncPage />)} />
          <Route path="/maintenance" element={feature('maintenance-mode', <MaintenanceModePage />)} />
          <Route path="/learning" element={feature('learning-courses', <LearningCoursesPage />)} />
          <Route path="/polls" element={feature('polls-surveys', <PollsSurveysPage />)} />
          <Route path="/reports" element={feature('report-center', <ReportCenterPage />)} />
          <Route path="/deep-links" element={feature('deep-link-handler', <DeepLinkHandlerPage />)} />
          <Route path="/share-repost" element={feature('share-repost', <ShareRepostPage />)} />
          <Route path="/media-viewer" element={feature('media-viewer', <MediaViewerPage />)} />
          <Route path="/trending" element={feature('trending', <HashtagsTrendingPage />)} />
          <Route path="/explore-recommendations" element={feature('explore-recommendation', <ExploreRecommendationPage />)} />
          <Route path="/business-profile" element={feature('business-profile', <BusinessProfilePage />)} />
          <Route path="/seller-profile" element={feature('seller-profile', <SellerProfilePage />)} />
          <Route path="/recruiter-profile" element={feature('recruiter-profile', <RecruiterProfilePage />)} />
          <Route path="/profile" element={feature('profile', <ProfilePage />)} />
          <Route path="/settings" element={feature('settings', <SettingsPage />)} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
