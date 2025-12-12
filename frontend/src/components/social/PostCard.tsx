import { useState } from 'react';
import type { Post, User } from '../../types/social';
import { UserAvatar } from './UserAvatar';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
}

export function PostCard({
  post,
  currentUser,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onLikeComment,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleLike = () => {
    setIsLiking(true);
    onLike(post.id);
    setTimeout(() => setIsLiking(false), 400);
  };

  const handleDoubleClick = () => {
    if (!post.liked) {
      handleLike();
    }
  };

  return (
    <article 
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm 
                        border border-slate-200 dark:border-slate-800
                        overflow-hidden animate-fadeIn"
      aria-label={`Post by ${post.user.name}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={post.user} size="md" showStatus online />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 dark:text-white">
                {post.user.name}
              </span>
              {post.user.verified && (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <span>@{post.user.username}</span>
              <span>·</span>
              <span>{formatTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* More options */}
        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                          hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div 
          className="relative cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          {post.images.length === 1 ? (
            <img
              src={post.images[0]}
              alt="Post image"
              className="w-full max-h-[500px] object-cover"
            />
          ) : (
            <div className="relative">
              <img
                src={post.images[imageIndex]}
                alt={`Post image ${imageIndex + 1}`}
                className="w-full max-h-[500px] object-cover"
              />
              {/* Image navigation */}
              <div className="absolute inset-0 flex items-center justify-between px-2">
                <button
                  onClick={() => setImageIndex(prev => Math.max(0, prev - 1))}
                  className={`p-2 bg-black/50 hover:bg-black/70 text-white rounded-full
                            transition-all ${imageIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
                  disabled={imageIndex === 0}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setImageIndex(prev => Math.min(post.images!.length - 1, prev + 1))}
                  className={`p-2 bg-black/50 hover:bg-black/70 text-white rounded-full
                            transition-all ${imageIndex === post.images!.length - 1 ? 'opacity-0' : 'opacity-100'}`}
                  disabled={imageIndex === post.images!.length - 1}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              {/* Dots indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all
                              ${idx === imageIndex 
                                ? 'bg-white w-4' 
                                : 'bg-white/50 hover:bg-white/75'}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Like animation overlay */}
          {isLiking && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg 
                className="w-24 h-24 text-red-500 animate-heartBeat"
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          {post.likes > 0 && (
            <>
              <div className="flex -space-x-1">
                <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                </span>
              </div>
              <span>{formatNumber(post.likes)}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {post.comments.length > 0 && (
            <span>{formatNumber(post.comments.length)} comments</span>
          )}
          {post.shares > 0 && (
            <span>{formatNumber(post.shares)} shares</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center border-t border-b border-slate-200 dark:border-slate-800" role="group" aria-label="Post actions">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-3
                    font-medium transition-colors
                    ${post.liked 
                      ? 'text-red-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          aria-label={post.liked ? 'Unlike this post' : 'Like this post'}
          aria-pressed={post.liked}
        >
          <svg 
            className={`w-5 h-5 ${isLiking ? 'animate-heartBeat' : ''}`} 
            fill={post.liked ? 'currentColor' : 'none'} 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={post.liked ? 0 : 2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="hidden sm:inline">Like</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-3
                    text-slate-600 dark:text-slate-400 font-medium
                    hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label={showComments ? 'Hide comments' : 'Show comments'}
          aria-expanded={showComments}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="hidden sm:inline">Comment</span>
        </button>

        {/* Share */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="w-full flex items-center justify-center gap-2 py-3
                      text-slate-600 dark:text-slate-400 font-medium
                      hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Share this post"
            aria-expanded={showShareMenu}
            aria-haspopup="menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Share menu */}
          {showShareMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} aria-hidden="true" />
              <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20
                              bg-white dark:bg-slate-800 rounded-xl shadow-lg 
                              border border-slate-200 dark:border-slate-700
                              py-2 min-w-[180px] animate-scaleIn"
                role="menu"
                aria-label="Share options"
              >
                <button
                  onClick={() => { onShare(post.id); setShowShareMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300
                            hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                  role="menuitem"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Share to Feed
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300
                            hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                  role="menuitem"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Link
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300
                            hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                  role="menuitem"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send via Message
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={() => onBookmark(post.id)}
          className={`p-3 transition-colors
                    ${post.bookmarked 
                      ? 'text-yellow-500' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          aria-label={post.bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
          aria-pressed={post.bookmarked}
        >
          <svg 
            className="w-5 h-5" 
            fill={post.bookmarked ? 'currentColor' : 'none'} 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={post.bookmarked ? 0 : 2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="p-4 animate-slideUp">
          <CommentSection
            comments={post.comments}
            onAddComment={(content) => onComment(post.id, content)}
            onLikeComment={(commentId) => onLikeComment(post.id, commentId)}
            currentUser={currentUser}
            postId={post.id}
          />
        </div>
      )}
    </article>
  );
}

