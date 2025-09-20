import { motion } from 'framer-motion';
import { useState } from 'react';

interface TagManagerProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  allTags?: string[];
}

export const TagManager: React.FC<TagManagerProps> = ({
  tags,
  onAddTag,
  onRemoveTag,
  allTags = []
}) => {
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onAddTag(tag);
      setNewTag('');
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const suggestedTags = allTags.filter(tag => 
    tag.toLowerCase().includes(newTag.toLowerCase()) && 
    !tags.includes(tag) &&
    newTag.length > 0
  );

  return (
    <div>
      <label className="block text-sm font-mono font-medium text-gray-700 dark:text-gray-300 mb-2">
        🏷️ Tags
      </label>
      
      {/* Existing Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag) => (
          <motion.span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-mono"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {tag}
            <button
              onClick={() => onRemoveTag(tag)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 ml-1"
            >
              ✕
            </button>
          </motion.span>
        ))}
      </div>

      {/* Add New Tag */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => {
              setNewTag(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add tag..."
          />
          <motion.button
            onClick={handleAddTag}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-mono"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!newTag.trim()}
          >
            ➕
          </motion.button>
        </div>

        {/* Tag Suggestions */}
        {showSuggestions && suggestedTags.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {suggestedTags.slice(0, 5).map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  onAddTag(tag);
                  setNewTag('');
                  setShowSuggestions(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg"
              >
                🏷️ {tag}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TagManager;