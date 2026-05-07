export type ThemeMode = 'light' | 'dark';

export type AppPage =
  | 'home'
  | 'explore'
  | 'marketplace'
  | 'jobs'
  | 'events'
  | 'communities'
  | 'pages'
  | 'calls'
  | 'live-streams'
  | 'notifications'
  | 'messages'
  | 'connections'
  | 'profile'
  | 'settings';

export type AuthView = 'login' | 'register' | 'forgot-password';

export interface ViewerUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string;
  bio: string;
  role: string;
  profileType?: 'user' | 'creator' | 'business';
  capabilities?: {
    canCreateJobs?: boolean;
    canCreateMarketplaceProducts?: boolean;
    canCreatePages?: boolean;
  };
  verified: boolean;
  followers?: number;
  following?: number;
  location?: string;
  website?: string;
  coverImage?: string;
  headline?: string;
}

export interface SessionState {
  accessToken: string;
  refreshToken?: string;
  sessionId?: string;
  user: ViewerUser;
}

export interface StoryView {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  media?: string;
  user: ViewerUser;
}

export interface FeedPostView {
  id: string;
  network: 'x' | 'instagram' | 'facebook' | 'linkedin';
  user: ViewerUser;
  headline: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  createdAt: string;
  tags: string[];
}

export interface ReelView {
  id: string;
  caption: string;
  thumbnail: string;
  audioName: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  user: ViewerUser;
}

export interface JobView {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedTime: string;
  skills: string[];
  featured: boolean;
  saved: boolean;
  applied: boolean;
}

export interface CommunityView {
  id: string;
  name: string;
  description: string;
  category: string;
  privacy: string;
  location: string;
  memberCount: number;
  tags: string[];
}

export interface MarketplaceItemView {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  status: string;
  sellerName: string;
  image?: string;
  category?: string;
}

export interface EventView {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  status: string;
  attendeeCount: number;
  image?: string;
}

export interface PageView {
  id: string;
  name: string;
  description: string;
  category: string;
  followers: number;
  actionLabel: string;
  image?: string;
}

export interface CallView {
  id: string;
  name: string;
  type: string;
  state: string;
  time: string;
  avatarUrl?: string;
}

export interface LiveStreamView {
  id: string;
  title: string;
  description: string;
  hostName: string;
  status: string;
  viewerCount: number;
  category: string;
  image?: string;
}

export interface TrendView {
  id: string;
  topic: string;
  detail: string;
  volume: string;
}

export interface NotificationView {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  unread: boolean;
  entityType?: string;
  actorName?: string;
}

export interface SearchItemView {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  image?: string;
}

export interface DashboardStats {
  posts: number;
  stories: number;
  reels: number;
  communities: number;
  jobs: number;
  notifications: number;
}

export interface DashboardData {
  userSuggestions: ViewerUser[];
  stories: StoryView[];
  posts: FeedPostView[];
  reels: ReelView[];
  jobs: JobView[];
  communities: CommunityView[];
  trends: TrendView[];
  notifications: NotificationView[];
  search: SearchItemView[];
  stats: DashboardStats;
}

export interface PostMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  alt: string;
  poster?: string;
}

export interface PostComment {
  id: string;
  user: ViewerUser;
  message: string;
  createdAt: string;
}

export interface SocialPost extends FeedPostView {
  excerpt?: string;
  media: PostMedia[];
  liked: boolean;
  saved: boolean;
  visibility: 'public' | 'connections' | 'private';
  commentsList: PostComment[];
}

export interface SuggestionItem {
  id: string;
  user: ViewerUser;
  reason: string;
  mutualCount: number;
  following: boolean;
}

export interface AppNotification extends NotificationView {
  icon: 'heart' | 'message' | 'user-plus' | 'sparkles' | 'briefcase';
  cta?: string;
}

export interface TrendItem extends TrendView {
  category: string;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  status?: 'sent' | 'seen';
}

export interface ChatThread {
  id: string;
  participant: ViewerUser;
  roleLabel: string;
  preview: string;
  unreadCount: number;
  lastActive: string;
  online: boolean;
  messages: ChatMessage[];
}

export interface ConnectionItem {
  id: string;
  user: ViewerUser;
  relationship: 'following' | 'requested' | 'teammate' | 'mentor';
  note: string;
  sharedTags: string[];
}

export interface ProfileMetric {
  label: string;
  value: string;
}

export interface ProfileHighlight {
  id: string;
  label: string;
  value: string;
  description: string;
}

export interface UserProfile {
  user: ViewerUser;
  coverImage: string;
  headline: string;
  about: string;
  location: string;
  website: string;
  joinedLabel: string;
  skills: string[];
  metrics: ProfileMetric[];
  highlights: ProfileHighlight[];
}

export interface ExploreCluster {
  id: string;
  title: string;
  description: string;
  image: string;
  stat: string;
}

export interface SettingsItem {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface SettingsGroup {
  id: string;
  title: string;
  items: SettingsItem[];
}

export interface SocialAppData {
  stories: StoryView[];
  posts: SocialPost[];
  reels: ReelView[];
  marketplace: MarketplaceItemView[];
  suggestions: SuggestionItem[];
  trends: TrendItem[];
  notifications: AppNotification[];
  chats: ChatThread[];
  calls: CallView[];
  liveStreams: LiveStreamView[];
  connections: ConnectionItem[];
  explore: ExploreCluster[];
  profile: UserProfile;
  jobs: JobView[];
  events: EventView[];
  communities: CommunityView[];
  pages: PageView[];
  settings: SettingsGroup[];
}

export interface AuthResult {
  ok: boolean;
  message: string;
}

export interface SocialAppState {
  session: SessionState | null;
  data: SocialAppData;
  isLoading: boolean;
  isRefreshing: boolean;
  loadError: string | null;
  authMessage: string | null;
  searchQuery: string;
  selectedChatId: string;
  setSearchQuery: (value: string) => void;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: { name: string; email: string; password: string }) => Promise<AuthResult>;
  sendResetLink: (email: string) => Promise<AuthResult>;
  logout: () => void;
  createPost: (input: { content: string; mediaType: 'text' | 'image' | 'video' }) => Promise<AuthResult>;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, message: string) => void;
  markNotificationRead: (notificationId: string) => void;
  setSelectedChatId: (chatId: string) => void;
  sendMessage: (chatId: string, message: string) => void;
  toggleFollowSuggestion: (suggestionId: string) => void;
  updateProfile: (input: Partial<UserProfile['user']> & { about?: string; website?: string; location?: string }) => void;
}

export interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export interface AppOutletContext {
  app: SocialAppState;
  theme: ThemeState;
}
