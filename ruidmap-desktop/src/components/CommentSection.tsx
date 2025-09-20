import { motion } from 'framer-motion';
import { useState } from 'react';
import { Comment } from '../types';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (text: string, author: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onAddComment
}) => {
  const [newComment, setNewComment] = useState('');
  const authorName = 'User'; // In a real app, this would come from user context

  const handleAddComment = () => {
    const text = newComment.trim();
    if (text) {
      onAddComment(text, authorName);
      setNewComment('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      <label className="block text-sm font-mono font-medium text-gray-700 dark:text-gray-300 mb-2">
        💬 Comments ({comments.length})
      </label>

      {/* Comments List */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 font-mono text-sm py-4">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <motion.div
              key={comment.id}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-medium text-gray-700 dark:text-gray-300">
                  👤 {comment.author}
                </span>
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="font-mono text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {comment.text}
              </p>
            </motion.div>
          ))
        )}
      </div>

      {/* Add New Comment */}
      <div className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Add a comment... (Ctrl+Enter to submit)"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
            Ctrl+Enter to submit
          </span>
          <motion.button
            onClick={handleAddComment}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-mono"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!newComment.trim()}
          >
            💬 Comment
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;