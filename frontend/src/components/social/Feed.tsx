import { useState, useEffect, useCallback, useRef } from 'react';
import type { Post, User } from '../../types/social';
import { PostCard } from './PostCard';
import { CreatePost } from './CreatePost';

interface FeedProps {
  initialPosts: Post[];
  currentUser: User;
}

export function Feed({ initialPosts, currentUser }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Like a post
  const handleLike = useCallback((postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            liked: !post.liked, 
            likes: post.liked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  }, []);

  // Add comment to a post
  const handleComment = useCallback((postId: string, content: string) => {
    const newComment = {
      id: Date.now().toString(),
      user: currentUser,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      liked: false,
    };

    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    ));
  }, [currentUser]);

  // Share a post (placeholder)
  const handleShare = useCallback((postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, shares: post.shares + 1 }
        : post
    ));
    // In a real app, this would open a share dialog
    console.log('Sharing post:', postId);
  }, []);

  // Bookmark a post
  const handleBookmark = useCallback((postId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, bookmarked: !post.bookmarked }
        : post
    ));
  }, []);

  // Like a comment
  const handleLikeComment = useCallback((postId: string, commentId: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: post.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, liked: !comment.liked, likes: comment.liked ? comment.likes - 1 : comment.likes + 1 }
                : comment
            )
          }
        : post
    ));
  }, []);

  // Create a new post
  const handleCreatePost = useCallback((content: string, images: string[]) => {
    const newPost: Post = {
      id: Date.now().toString(),
      user: currentUser,
      content,
      images: images.length > 0 ? images : undefined,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      shares: 0,
      liked: false,
      bookmarked: false,
    };

    setPosts(prev => [newPost, ...prev]);
  }, [currentUser]);

  // Infinite scroll - load more posts
  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, this would fetch more posts from an API
    // For demo purposes, we'll just stop after a while
    const shouldHaveMore = posts.length < 20;
    
    if (shouldHaveMore) {
      // Real Unsplash image URLs for loaded posts
      const sampleImages = [
        'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=600&fit=crop',
      ];

      // Generate some placeholder posts
      const newPosts: Post[] = Array(3).fill(null).map((_, i) => {
        const hasImage = Math.random() > 0.4;
        const imageIndex = Math.floor(Math.random() * sampleImages.length);
        
        return {
          id: `loaded-${Date.now()}-${i}`,
          user: {
            id: `user-${Math.random()}`,
            name: ['Alex Johnson', 'Emma Wilson', 'Michael Brown', 'Sarah Davis'][Math.floor(Math.random() * 4)],
            username: `user${Math.floor(Math.random() * 1000)}`,
            verified: Math.random() > 0.7,
          },
          content: [
            'Just discovered this amazing coffee shop! ☕️ The ambiance is perfect for working.',
            'Working on something exciting! Can\'t wait to share it with you all. 🚀',
            'Beautiful sunset today. Nature never fails to amaze me. 🌅',
            'Finally finished that book I\'ve been reading. Highly recommend!',
            'New gear day! 🎧 So excited to try these out.',
            'Morning productivity vibes. Let\'s make today count! 💪',
            'Weekend adventures with friends. Making memories! 📸',
            'Just wrapped up an amazing project. Feeling accomplished! ✨',
          ][Math.floor(Math.random() * 8)],
          images: hasImage ? [sampleImages[imageIndex]] : undefined,
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
          likes: Math.floor(Math.random() * 500),
          comments: [],
          shares: Math.floor(Math.random() * 50),
          liked: false,
          bookmarked: false,
        };
      });

      setPosts(prev => [...prev, ...newPosts]);
    }
    
    setHasMore(shouldHaveMore);
    setIsLoading(false);
  }, [isLoading, hasMore, posts.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMorePosts, hasMore, isLoading]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Create post */}
      <CreatePost currentUser={currentUser} onCreatePost={handleCreatePost} />

      {/* Posts */}
      {posts.map((post, index) => (
        <div 
          key={post.id}
          style={{ animationDelay: `${index * 50}ms` }}
          className="animate-slideUp"
        >
          <PostCard
            post={post}
            currentUser={currentUser}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onBookmark={handleBookmark}
            onLikeComment={handleLikeComment}
          />
        </div>
      ))}

      {/* Infinite scroll loader */}
      <div ref={loaderRef} className="py-8">
        {isLoading && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Loading more posts...</span>
          </div>
        )}
        
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800
                            flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              You're all caught up!
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              You've seen all the posts from the past week
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

