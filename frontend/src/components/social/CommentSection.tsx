import { useState } from 'react';
import type { Comment, User } from '../../types/social';
import { UserAvatar } from './UserAvatar';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  onLikeComment: (commentId: string) => void;
  currentUser: User;
  postId: string;
}

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
  depth?: number;
}

function CommentItem({ comment, onLike, onReply, depth = 0 }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const handleLike = () => {
    setIsLiking(true);
    onLike(comment.id);
    setTimeout(() => setIsLiking(false), 300);
  };

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyInput(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-10 mt-3' : ''}`}>
      <div className="flex gap-3">
        <UserAvatar user={comment.user} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                {comment.user.name}
              </span>
              {comment.user.verified && (
                <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1 ml-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatTime(comment.createdAt)}
            </span>
            <button
              onClick={handleLike}
              className={`text-xs font-semibold transition-colors
                        ${comment.liked 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        } ${isLiking ? 'animate-heartBeat' : ''}`}
            >
              Like{comment.likes > 0 && ` · ${comment.likes}`}
            </button>
            {depth < 2 && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 
                          hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Reply
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <div className="flex gap-2 mt-2 animate-fadeIn">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-1.5 text-sm rounded-full
                          bg-slate-100 dark:bg-slate-800 
                          border border-slate-200 dark:border-slate-700
                          text-slate-900 dark:text-white
                          placeholder:text-slate-400 dark:placeholder:text-slate-500
                          focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
              />
              <button
                onClick={handleReplySubmit}
                disabled={!replyContent.trim()}
                className="px-3 py-1.5 text-sm font-medium text-white
                          bg-blue-500 hover:bg-blue-600 rounded-full
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-colors"
              >
                Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ 
  comments, 
  onAddComment, 
  onLikeComment,
  currentUser,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 2);
  const hasMoreComments = comments.length > 2;

  const handleReply = (commentId: string, content: string) => {
    console.log('Reply to', commentId, ':', content);
    // In a real app, this would add the reply to the comment
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
      {/* Comment input */}
      <div className="flex gap-3 mb-4">
        <UserAvatar user={currentUser} size="sm" />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 text-sm rounded-full
                      bg-slate-100 dark:bg-slate-800 
                      border border-slate-200 dark:border-slate-700
                      text-slate-900 dark:text-white
                      placeholder:text-slate-400 dark:placeholder:text-slate-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30
                      rounded-full disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors"
            aria-label="Send comment"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>

      {/* View more comments */}
      {hasMoreComments && !showAllComments && (
        <button
          onClick={() => setShowAllComments(true)}
          className="text-sm font-medium text-slate-500 dark:text-slate-400
                    hover:text-slate-700 dark:hover:text-slate-300
                    mb-4 transition-colors"
        >
          View all {comments.length} comments
        </button>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {displayedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onLike={onLikeComment}
            onReply={handleReply}
          />
        ))}
      </div>
    </div>
  );
}

