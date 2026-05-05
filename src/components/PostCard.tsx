import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start space-x-4 mb-4">
        <img 
          src={post.user.avatar} 
          alt={post.user.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-900 dark:text-white">{post.user.name}</h3>
            <span className="text-sm text-gray-500">@{post.user.username}</span>
          </div>
          <p className="text-sm text-gray-500">{post.createdAt.toLocaleDateString()}</p>
        </div>
        <MoreVertical className="text-gray-500 w-5 h-5 cursor-pointer" />
      </div>
      <p className="text-gray-900 dark:text-white mb-4">{post.content}</p>
      {post.image && (
        <img 
          src={post.image}
          alt="Post"
          className="w-full rounded-lg mb-4"
        />
      )}
      <div className="flex items-center space-x-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
          <Heart size={20} />
          <span>{post.likes}</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
          <MessageCircle size={20} />
          <span>{post.comments}</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default PostCard;

