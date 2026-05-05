import {
  AppNotification,
  ChatThread,
  CommunityView,
  ConnectionItem,
  ExploreCluster,
  JobView,
  ReelView,
  SessionState,
  SocialAppData,
  SocialPost,
  StoryView,
  SuggestionItem,
  TrendItem,
  UserProfile,
  ViewerUser,
  SettingsGroup,
} from '../types';
import { createId } from '../lib/utils';

const placeholderCover =
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80';

function makeAvatar(name: string, background: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=ffffff`;
}

export function createMockViewer(overrides: Partial<ViewerUser> = {}): ViewerUser {
  const name = overrides.name ?? 'Ariana Cole';
  return {
    id: overrides.id ?? 'viewer-1',
    name,
    username: overrides.username ?? 'ariana.cole',
    email: overrides.email ?? 'ariana@optizenqor.com',
    avatar: overrides.avatar ?? makeAvatar(name, '1e3a8a'),
    bio:
      overrides.bio ??
      'Building calm, high-signal communities around startups, product design, and thoughtful technology.',
    role: overrides.role ?? 'Product Strategist',
    verified: overrides.verified ?? true,
    followers: overrides.followers ?? 18400,
    following: overrides.following ?? 612,
    location: overrides.location ?? 'Dhaka, Bangladesh',
    website: overrides.website ?? 'optizenqor.social',
    coverImage: overrides.coverImage ?? placeholderCover,
    headline: overrides.headline ?? 'Designing social experiences that feel warm, useful, and alive.',
  };
}

export function createMockSession(overrides: Partial<ViewerUser> = {}): SessionState {
  const user = createMockViewer(overrides);
  return {
    accessToken: 'demo-access-token',
    refreshToken: 'demo-refresh-token',
    sessionId: createId('session'),
    user,
  };
}

function createPeople() {
  const people: ViewerUser[] = [
    {
      id: 'user-1',
      name: 'Nadia Rahman',
      username: 'nadiarahman',
      avatar: makeAvatar('Nadia Rahman', '0f766e'),
      bio: 'Founder notes, hiring rituals, and quiet product lessons.',
      role: 'Founder',
      verified: true,
      followers: 9300,
      following: 250,
      location: 'Singapore',
      website: 'nadia.studio',
      coverImage:
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
      headline: 'Growing healthy internet companies with tiny, exceptional teams.',
    },
    {
      id: 'user-2',
      name: 'Marcus Lee',
      username: 'marcuslee',
      avatar: makeAvatar('Marcus Lee', 'be123c'),
      bio: 'AI product designer sharing systems, workflows, and launch experiments.',
      role: 'Product Designer',
      verified: true,
      followers: 12100,
      following: 310,
      location: 'Seoul, South Korea',
      website: 'marcus.design',
      coverImage:
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      headline: 'Crafting interfaces that feel editorial, useful, and unmistakably human.',
    },
    {
      id: 'user-3',
      name: 'Layla Chen',
      username: 'laylachen',
      avatar: makeAvatar('Layla Chen', '7c3aed'),
      bio: 'Community architect for remote-first teams and creator ecosystems.',
      role: 'Community Lead',
      verified: false,
      followers: 5600,
      following: 892,
      location: 'Toronto, Canada',
      website: 'layla.community',
      coverImage:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
      headline: 'Helping digital communities become durable, welcoming places to belong.',
    },
    {
      id: 'user-4',
      name: 'Tariq Hasan',
      username: 'tariqbuilds',
      avatar: makeAvatar('Tariq Hasan', 'c2410c'),
      bio: 'Shipping founder-friendly growth stacks, dashboards, and demand systems.',
      role: 'Growth Engineer',
      verified: false,
      followers: 4100,
      following: 520,
      location: 'Dubai, UAE',
      website: 'tariqbuilds.dev',
      coverImage:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      headline: 'Making growth feel measurable, elegant, and repeatable.',
    },
  ];

  return people;
}

function createStories(people: ViewerUser[]): StoryView[] {
  const accents = [
    'from-sky-500 via-cyan-400 to-teal-300',
    'from-orange-400 via-amber-300 to-pink-400',
    'from-fuchsia-500 via-violet-400 to-sky-300',
    'from-emerald-500 via-teal-400 to-cyan-300',
  ];

  return people.map((person, index) => ({
    id: `story-${person.id}`,
    title: person.name,
    subtitle: ['Studio diary', 'Behind the scenes', 'Launch recap', 'Live workshop'][index % 4],
    accent: accents[index % accents.length],
    media:
      [
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
      ][index % 4],
    user: person,
  }));
}

function createPosts(viewer: ViewerUser, people: ViewerUser[]): SocialPost[] {
  return [
    {
      id: 'post-1',
      network: 'linkedin',
      user: people[0],
      headline: 'Founder Update',
      content:
        'We replaced five disconnected growth dashboards with one clean operating room. The best part was not the data, it was the shared calm it gave the team every morning.',
      excerpt: 'A product update on replacing noisy dashboards with one high-clarity command center.',
      likes: 1240,
      comments: 48,
      shares: 36,
      views: 18200,
      createdAt: '2h ago',
      tags: ['ops', 'founders', 'product'],
      image:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
      media: [
        {
          id: 'media-1',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
          alt: 'Team reviewing a dashboard together',
        },
      ],
      liked: true,
      saved: false,
      visibility: 'public',
      commentsList: [
        {
          id: 'comment-1',
          user: viewer,
          message: 'The idea of shared calm is such a strong product outcome.',
          createdAt: '46m ago',
        },
        {
          id: 'comment-2',
          user: people[2],
          message: 'Would love to hear how you rolled adoption out team by team.',
          createdAt: '35m ago',
        },
      ],
    },
    {
      id: 'post-2',
      network: 'instagram',
      user: people[1],
      headline: 'Studio Reel',
      content:
        'Prototype day at the lab. We tested a softer navigation system with card depth, glass blur, and much stronger editorial rhythm.',
      likes: 2860,
      comments: 120,
      shares: 94,
      views: 48100,
      createdAt: '5h ago',
      tags: ['ui', 'motion', 'branding'],
      image:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      media: [
        {
          id: 'media-2',
          type: 'video',
          url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          alt: 'Short looping product studio clip',
          poster:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      liked: false,
      saved: true,
      visibility: 'public',
      commentsList: [
        {
          id: 'comment-3',
          user: people[3],
          message: 'The spacing system feels premium already.',
          createdAt: '3h ago',
        },
      ],
    },
    {
      id: 'post-3',
      network: 'x',
      user: viewer,
      headline: 'Thought Note',
      content:
        'Social products feel better when they help people do one thing clearly: notice the right signal before the noise wins.',
      likes: 326,
      comments: 17,
      shares: 11,
      views: 5200,
      createdAt: 'Yesterday',
      tags: ['strategy', 'social'],
      media: [],
      liked: false,
      saved: false,
      visibility: 'connections',
      commentsList: [],
    },
  ];
}

function createReels(people: ViewerUser[]): ReelView[] {
  return [
    {
      id: 'reel-1',
      caption: 'Workspace reset for a product sprint morning.',
      thumbnail:
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
      audioName: 'Original audio',
      likes: 4020,
      comments: 202,
      shares: 44,
      createdAt: '3h ago',
      user: people[0],
    },
    {
      id: 'reel-2',
      caption: 'Five micro-interactions that make messages feel alive.',
      thumbnail:
        'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80',
      audioName: 'Studio session',
      likes: 5200,
      comments: 330,
      shares: 120,
      createdAt: '7h ago',
      user: people[1],
    },
  ];
}

function createSuggestions(people: ViewerUser[]): SuggestionItem[] {
  return people.map((person, index) => ({
    id: `suggestion-${person.id}`,
    user: person,
    reason: ['Shared product circles', 'Popular with founders you follow', 'Design systems overlap', 'Strong community fit'][index % 4],
    mutualCount: [18, 12, 7, 21][index % 4],
    following: index === 1,
  }));
}

function createTrends(): TrendItem[] {
  return [
    {
      id: 'trend-1',
      topic: '#CalmProducts',
      detail: 'Teams are discussing lower-noise dashboards and mindful notifications.',
      volume: '14K discussions',
      category: 'Product',
    },
    {
      id: 'trend-2',
      topic: '#CreatorOps',
      detail: 'Creators are sharing repeatable workflows for community and content systems.',
      volume: '9.2K discussions',
      category: 'Creator economy',
    },
    {
      id: 'trend-3',
      topic: '#RemoteRituals',
      detail: 'People are posting async rituals that keep teams aligned without meetings.',
      volume: '6.8K discussions',
      category: 'Future of work',
    },
  ];
}

function createNotifications(people: ViewerUser[]): AppNotification[] {
  return [
    {
      id: 'notification-1',
      title: `${people[0].name} liked your product note`,
      body: 'Your post about signal versus noise is gaining traction with startup operators.',
      createdAt: '12m ago',
      unread: true,
      icon: 'heart',
      cta: 'Reply with a follow-up post',
    },
    {
      id: 'notification-2',
      title: `${people[2].name} commented on your update`,
      body: '“This framing is exactly how community teams should think about notifications.”',
      createdAt: '1h ago',
      unread: true,
      icon: 'message',
      cta: 'Open comments',
    },
    {
      id: 'notification-3',
      title: `${people[1].name} invited you to a live critique room`,
      body: 'Join a 30-minute session on premium social interaction design.',
      createdAt: '4h ago',
      unread: false,
      icon: 'sparkles',
    },
  ];
}

function createChats(people: ViewerUser[], viewer: ViewerUser): ChatThread[] {
  return [
    {
      id: 'chat-1',
      participant: people[1],
      roleLabel: 'Design collaborator',
      preview: 'Can you review the updated explore cards before launch?',
      unreadCount: 2,
      lastActive: 'Just now',
      online: true,
      messages: [
        {
          id: 'message-1',
          authorId: people[1].id,
          body: 'Can you review the updated explore cards before launch?',
          createdAt: '9:14 AM',
          status: 'seen',
        },
        {
          id: 'message-2',
          authorId: viewer.id,
          body: 'Yes, send me the latest pass. I want to check hierarchy and mobile rhythm.',
          createdAt: '9:16 AM',
          status: 'seen',
        },
      ],
    },
    {
      id: 'chat-2',
      participant: people[0],
      roleLabel: 'Founder circle',
      preview: 'We should package this dashboard thinking into a community post.',
      unreadCount: 0,
      lastActive: '45m ago',
      online: false,
      messages: [
        {
          id: 'message-3',
          authorId: people[0].id,
          body: 'We should package this dashboard thinking into a community post.',
          createdAt: '8:22 AM',
          status: 'seen',
        },
      ],
    },
  ];
}

function createConnections(people: ViewerUser[]): ConnectionItem[] {
  return [
    {
      id: 'connection-1',
      user: people[0],
      relationship: 'mentor',
      note: 'Scaling healthy teams and thoughtful product culture.',
      sharedTags: ['Founders', 'Product Ops', 'Growth'],
    },
    {
      id: 'connection-2',
      user: people[1],
      relationship: 'teammate',
      note: 'Frequent collaborator on interface systems and launch reviews.',
      sharedTags: ['Design', 'Brand', 'Motion'],
    },
    {
      id: 'connection-3',
      user: people[2],
      relationship: 'following',
      note: 'Strong lens on community-led product design.',
      sharedTags: ['Community', 'Events', 'Moderation'],
    },
  ];
}

function createExploreClusters(posts: SocialPost[], reels: ReelView[], people: ViewerUser[]): ExploreCluster[] {
  return [
    {
      id: 'explore-1',
      title: 'Design systems for social products',
      description: 'A gallery of product patterns, motion studies, and component ideas.',
      image: posts[0].image ?? reels[0].thumbnail,
      stat: '32 featured drops',
    },
    {
      id: 'explore-2',
      title: 'People building calm tech',
      description: 'Founders and operators prioritizing clarity, trust, and durable communities.',
      image: people[0].coverImage ?? placeholderCover,
      stat: '94 active voices',
    },
    {
      id: 'explore-3',
      title: 'Short-form creator labs',
      description: 'Tactical clips on content workflows, AI tools, and audience growth.',
      image: reels[1].thumbnail,
      stat: '11 trending channels',
    },
  ];
}

function createProfile(viewer: ViewerUser): UserProfile {
  return {
    user: viewer,
    coverImage: viewer.coverImage ?? placeholderCover,
    headline:
      viewer.headline ?? 'Building premium social experiences that connect clarity, community, and momentum.',
    about:
      'I care about social products that feel generous to use. My work usually sits between product strategy, interface direction, content systems, and the messy human details that make digital spaces feel trustworthy.',
    location: viewer.location ?? 'Dhaka, Bangladesh',
    website: viewer.website ?? 'optizenqor.social',
    joinedLabel: 'Joined January 2024',
    skills: ['Product strategy', 'Community design', 'Design systems', 'Content operations'],
    metrics: [
      { label: 'Followers', value: '18.4K' },
      { label: 'Following', value: '612' },
      { label: 'Posts', value: '248' },
      { label: 'Engagement', value: '8.9%' },
    ],
    highlights: [
      {
        id: 'highlight-1',
        label: 'Top note',
        value: 'Signal over noise',
        description: 'A recurring theme across posts, talks, and product reviews.',
      },
      {
        id: 'highlight-2',
        label: 'Current build',
        value: 'OptiZenqor Social',
        description: 'A refined social experience for creators, founders, and communities.',
      },
      {
        id: 'highlight-3',
        label: 'Open to',
        value: 'Collaborations',
        description: 'Design critiques, product strategy, and community systems workshops.',
      },
    ],
  };
}

function createJobs(): JobView[] {
  return [
    {
      id: 'job-1',
      title: 'Senior Product Designer',
      company: 'Northstar Labs',
      location: 'Remote',
      type: 'Full-time',
      salary: '$80k - $110k',
      postedTime: '2d ago',
      skills: ['Figma', 'Systems', 'Research'],
      featured: true,
      saved: false,
      applied: false,
    },
    {
      id: 'job-2',
      title: 'Community Operations Lead',
      company: 'Orbit House',
      location: 'Hybrid',
      type: 'Contract',
      salary: '$4k/mo',
      postedTime: '5d ago',
      skills: ['Community', 'Events', 'CRM'],
      featured: false,
      saved: true,
      applied: false,
    },
  ];
}

function createCommunities(): CommunityView[] {
  return [
    {
      id: 'community-1',
      name: 'Calm Product Builders',
      description: 'A space for teams building software with clarity and trust.',
      category: 'Product',
      privacy: 'Public',
      location: 'Global',
      memberCount: 4200,
      tags: ['Product', 'Design', 'Leadership'],
    },
    {
      id: 'community-2',
      name: 'Founder Notes Club',
      description: 'Honest operating notes from startup founders and early teams.',
      category: 'Founders',
      privacy: 'Private',
      location: 'Global',
      memberCount: 1800,
      tags: ['Startup', 'Growth', 'Fundraising'],
    },
  ];
}

function createSettings(): SettingsGroup[] {
  return [
    {
      id: 'appearance',
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          title: 'Dark mode',
          description: 'Switch the workspace tone for day or night.',
          enabled: false,
        },
        {
          id: 'glass',
          title: 'Glass panels',
          description: 'Keep premium blur and layered surfaces across the UI.',
          enabled: true,
        },
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy',
      items: [
        {
          id: 'profile-visibility',
          title: 'Profile visibility',
          description: 'Your profile is visible to the wider network.',
          enabled: true,
        },
      ],
    },
  ];
}

export function createMockAppData(viewerOverrides: Partial<ViewerUser> = {}): SocialAppData {
  const viewer = createMockViewer(viewerOverrides);
  const people = createPeople();
  const stories = createStories(people);
  const posts = createPosts(viewer, people);
  const reels = createReels(people);

  return {
    stories,
    posts,
    reels,
    suggestions: createSuggestions(people),
    trends: createTrends(),
    notifications: createNotifications(people),
    chats: createChats(people, viewer),
    connections: createConnections(people),
    explore: createExploreClusters(posts, reels, people),
    profile: createProfile(viewer),
    jobs: createJobs(),
    communities: createCommunities(),
    settings: createSettings(),
  };
}
