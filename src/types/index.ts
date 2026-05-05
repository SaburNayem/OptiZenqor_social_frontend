export interface ViewerUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string;
  bio: string;
  role: string;
  verified: boolean;
  followers?: number;
  following?: number;
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
