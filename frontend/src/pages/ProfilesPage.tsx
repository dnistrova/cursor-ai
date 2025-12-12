import { useState } from 'react';
import { UserProfile } from '../components/social/UserProfile';
import type { UserProfileProps } from '../components/social/UserProfile';

// Sample user data demonstrating different profile states
const sampleProfiles: Omit<UserProfileProps, 'onFollow' | 'onMessage' | 'onEditProfile'>[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    username: 'sarahjohnson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop',
    bio: '✨ Product Designer @TechCorp | Creating beautiful digital experiences | Speaker & Mentor | Coffee enthusiast ☕',
    location: 'San Francisco, CA',
    website: 'sarahdesigns.co',
    joinedDate: '2020-03-15',
    stats: {
      followers: 24500,
      following: 892,
      posts: 347,
    },
    isVerified: true,
    isOwnProfile: true,
    isFollowing: false,
  },
  {
    id: '2',
    name: 'Alex Chen',
    username: 'alexchendev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
    bio: '🚀 Full-stack developer | Open source contributor | Building the future of web | React, TypeScript, Node.js',
    location: 'Seattle, WA',
    website: 'github.com/alexchen',
    joinedDate: '2019-08-22',
    stats: {
      followers: 15200,
      following: 445,
      posts: 128,
    },
    isVerified: true,
    isOwnProfile: false,
    isFollowing: true,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    username: 'emmawilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1200&h=400&fit=crop',
    bio: '📸 Travel photographer | Capturing moments around the world | 50+ countries visited | Available for collaborations',
    location: 'London, UK',
    website: 'emmawilsonphoto.com',
    joinedDate: '2021-01-10',
    stats: {
      followers: 89700,
      following: 234,
      posts: 892,
    },
    isVerified: true,
    isOwnProfile: false,
    isFollowing: false,
  },
  {
    id: '4',
    name: 'Marcus Thompson',
    username: 'marcust',
    bio: 'Startup founder | Angel investor | Passionate about EdTech and sustainability 🌱',
    location: 'Austin, TX',
    joinedDate: '2022-06-05',
    stats: {
      followers: 3420,
      following: 567,
      posts: 45,
    },
    isVerified: false,
    isOwnProfile: false,
    isFollowing: false,
  },
];

export function ProfilesPage() {
  const [profiles, setProfiles] = useState(sampleProfiles);
  const [notifications, setNotifications] = useState<string[]>([]);

  const handleFollow = (userId: string) => {
    setProfiles(prev => prev.map(profile => 
      profile.id === userId 
        ? { ...profile, isFollowing: !profile.isFollowing }
        : profile
    ));
    
    const profile = profiles.find(p => p.id === userId);
    if (profile) {
      const action = profile.isFollowing ? 'Unfollowed' : 'Following';
      showNotification(`${action} ${profile.name}`);
    }
  };

  const handleMessage = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    if (profile) {
      showNotification(`Opening chat with ${profile.name}...`);
    }
  };

  const handleEditProfile = () => {
    showNotification('Opening profile editor...');
  };

  const showNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 3000);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            User Profiles
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Comprehensive user profile components with avatars, stats, bios, and interactive action buttons.
            Fully responsive and accessible.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { icon: '🎨', label: 'Responsive Design' },
            { icon: '♿', label: 'Accessible' },
            { icon: '🔄', label: 'Interactive' },
            { icon: '✨', label: 'TypeScript' },
          ].map((feature) => (
            <div 
              key={feature.label}
              className="flex items-center justify-center gap-2 py-3 px-4 
                       bg-white dark:bg-slate-800 rounded-xl shadow-sm
                       border border-slate-200 dark:border-slate-700"
            >
              <span className="text-xl">{feature.icon}</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {profiles.map((profile) => (
            <UserProfile
              key={profile.id}
              {...profile}
              onFollow={handleFollow}
              onMessage={handleMessage}
              onEditProfile={handleEditProfile}
            />
          ))}
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg
                     animate-[slideIn_0.3s_ease-out] flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {notification}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfilesPage;

