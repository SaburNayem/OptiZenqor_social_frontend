import { useState } from 'react';
import PostCard from './PostCard';
import { Post } from '../types';

const mockPosts: Post[] = [
  {
    id: '1',
    user: {
      id: '1',
      name: 'John Doe',
      username: 'johndoe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Full Stack Developer'
    },
    content: 'Just deployed my new social media app! 🚀 Built with React, Tailwind, and Vite. Check it out!',
    likes: 128,
    comments: 24,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    user: {
      id: '2',
      name: 'Jane Smith',
      username: 'janesmith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      bio: 'UI/UX Designer'
    },
    content: 'Loving the new dark mode toggle! So smooth and beautiful design. Great work team! 👏',
    likes: 89,
    comments: 12,
    createdAt: new Date('2024-01-14')
  },
];

const Feed = () => {
  const [posts] = useState(mockPosts);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <textarea 
          placeholder="What's happening?"
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
        />
        <div className="flex justify-end pt-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors">
            Post
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;

