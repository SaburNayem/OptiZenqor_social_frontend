export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  createdAt: Date;
}
