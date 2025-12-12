import { useState } from 'react';

export interface UserProfileStats {
  followers: number;
  following: number;
  posts: number;
}

export interface UserProfileProps {
  /** User's unique identifier */
  id: string;
  /** User's display name */
  name: string;
  /** User's username/handle */
  username: string;
  /** User's avatar URL */
  avatar?: string;
  /** User's cover/banner image URL */
  coverImage?: string;
  /** User's bio/description */
  bio?: string;
  /** User's location */
  location?: string;
  /** User's website URL */
  website?: string;
  /** When the user joined */
  joinedDate?: string;
  /** User's stats */
  stats: UserProfileStats;
  /** Whether the user is verified */
  isVerified?: boolean;
  /** Whether this is the current user's own profile */
  isOwnProfile?: boolean;
  /** Whether the current user is following this user */
  isFollowing?: boolean;
  /** Callback when follow button is clicked */
  onFollow?: (userId: string) => void;
  /** Callback when message button is clicked */
  onMessage?: (userId: string) => void;
  /** Callback when edit profile button is clicked */
  onEditProfile?: () => void;
}

/**
 * Comprehensive user profile component for social media applications.
 * Displays user information, stats, and action buttons.
 * Fully responsive and accessible.
 */
export function UserProfile({
  id,
  name,
  username,
  avatar,
  coverImage,
  bio,
  location,
  website,
  joinedDate,
  stats,
  isVerified = false,
  isOwnProfile = false,
  isFollowing = false,
  onFollow,
  onMessage,
  onEditProfile,
}: UserProfileProps) {
  const [following, setFollowing] = useState(isFollowing);
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);

  const handleFollow = () => {
    setFollowing(!following);
    onFollow?.(id);
  };

  const handleMessage = () => {
    onMessage?.(id);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <article 
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden
                 border border-slate-200 dark:border-slate-800"
      aria-label={`Profile of ${name}`}
    >
      {/* Cover Image */}
      <div className="relative h-32 sm:h-48 lg:h-56 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        {coverImage && (
          <img
            src={coverImage}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
        )}
        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" aria-hidden="true" />
      </div>

      {/* Profile Content */}
      <div className="relative px-4 sm:px-6 pb-6">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-20 mb-4">
          <div className="flex items-end gap-4">
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt={`${name}'s avatar`}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover 
                           border-4 border-white dark:border-slate-900 shadow-xl
                           bg-slate-100 dark:bg-slate-800"
                />
              ) : (
                <div 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl 
                           border-4 border-white dark:border-slate-900 shadow-xl
                           bg-gradient-to-br from-indigo-500 to-purple-600
                           flex items-center justify-center"
                  aria-label={`${name}'s avatar`}
                >
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {/* Online indicator */}
              <span 
                className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 
                         bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"
                aria-label="Online"
              />
            </div>
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden sm:flex items-center gap-3 mt-4 sm:mt-0">
            {isOwnProfile ? (
              <button
                onClick={onEditProfile}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl
                         border-2 border-slate-300 dark:border-slate-600
                         text-slate-700 dark:text-slate-300
                         hover:bg-slate-100 dark:hover:bg-slate-800
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                         transition-colors duration-200"
                aria-label="Edit your profile"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleMessage}
                  className="p-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-600
                           text-slate-700 dark:text-slate-300
                           hover:bg-slate-100 dark:hover:bg-slate-800
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                           transition-colors duration-200"
                  aria-label={`Send message to ${name}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button
                  onClick={handleFollow}
                  onMouseEnter={() => setIsHoveringFollow(true)}
                  onMouseLeave={() => setIsHoveringFollow(false)}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-offset-2
                           transition-all duration-200 min-w-[100px]
                           ${following
                             ? isHoveringFollow
                               ? 'bg-red-500 text-white focus:ring-red-500'
                               : 'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                             : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
                           }`}
                  aria-label={following ? `Unfollow ${name}` : `Follow ${name}`}
                  aria-pressed={following}
                >
                  {following ? (isHoveringFollow ? 'Unfollow' : 'Following') : 'Follow'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Name & Username */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {name}
            </h1>
            {isVerified && (
              <svg 
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-label="Verified account"
                role="img"
              >
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400">@{username}</p>
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
            {bio}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
          {location && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{location}</span>
            </div>
          )}
          {website && (
            <a 
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>{website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          {joinedDate && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Joined {formatDate(joinedDate)}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div 
          className="flex items-center gap-6 py-4 border-t border-slate-200 dark:border-slate-700"
          role="group"
          aria-label="Profile statistics"
        >
          <button 
            className="group text-center hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label={`${stats.posts} posts`}
          >
            <span className="block text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {formatNumber(stats.posts)}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Posts</span>
          </button>
          <button 
            className="group text-center hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label={`${stats.followers} followers`}
          >
            <span className="block text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {formatNumber(stats.followers)}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Followers</span>
          </button>
          <button 
            className="group text-center hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label={`Following ${stats.following} users`}
          >
            <span className="block text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {formatNumber(stats.following)}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Following</span>
          </button>
        </div>

        {/* Action Buttons - Mobile */}
        <div className="sm:hidden flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          {isOwnProfile ? (
            <button
              onClick={onEditProfile}
              className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl
                       border-2 border-slate-300 dark:border-slate-600
                       text-slate-700 dark:text-slate-300
                       hover:bg-slate-100 dark:hover:bg-slate-800
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                       transition-colors duration-200"
              aria-label="Edit your profile"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleFollow}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-offset-2
                         transition-all duration-200
                         ${following
                           ? 'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 focus:ring-slate-500'
                           : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
                         }`}
                aria-label={following ? `Unfollow ${name}` : `Follow ${name}`}
                aria-pressed={following}
              >
                {following ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={handleMessage}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl
                         border-2 border-slate-300 dark:border-slate-600
                         text-slate-700 dark:text-slate-300
                         hover:bg-slate-100 dark:hover:bg-slate-800
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                         transition-colors duration-200"
                aria-label={`Send message to ${name}`}
              >
                Message
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default UserProfile;


