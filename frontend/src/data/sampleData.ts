import type { Post, User } from '../types/social';

export const currentUser: User = {
  id: 'current',
  name: 'Alex Morgan',
  username: 'alexmorgan',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  verified: true,
};

export const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    username: 'sarahchen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    verified: true,
  },
  {
    id: '2',
    name: 'James Wilson',
    username: 'jameswilson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    verified: false,
  },
  {
    id: '3',
    name: 'Emily Davis',
    username: 'emilydavis',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    verified: true,
  },
  {
    id: '4',
    name: 'Michael Brown',
    username: 'michaelbrown',
    verified: false,
  },
  {
    id: '5',
    name: 'Jessica Taylor',
    username: 'jessicataylor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    verified: true,
  },
];

export const samplePosts: Post[] = [
  {
    id: '1',
    user: sampleUsers[0],
    content: `Just launched my new design portfolio! 🎨✨ 

After months of hard work, I'm so excited to finally share it with the world. Check it out and let me know what you think!

#design #portfolio #webdesign #creative`,
    images: [
      'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&h=600&fit=crop',
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    likes: 234,
    comments: [
      {
        id: 'c1',
        user: sampleUsers[2],
        content: 'This looks absolutely stunning! Love the minimalist approach. 😍',
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        likes: 12,
        liked: false,
        replies: [
          {
            id: 'c1r1',
            user: sampleUsers[0],
            content: 'Thank you so much Emily! Really appreciate the kind words 🙏',
            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            likes: 3,
            liked: false,
          },
        ],
      },
      {
        id: 'c2',
        user: sampleUsers[1],
        content: 'The animations are so smooth! What library did you use?',
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        likes: 5,
        liked: false,
      },
    ],
    shares: 45,
    liked: false,
    bookmarked: false,
  },
  {
    id: '2',
    user: sampleUsers[4],
    content: `Coffee shop hopping in Tokyo ☕🇯🇵 

Found this hidden gem in Shibuya. The matcha latte here is incredible!`,
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop',
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    likes: 567,
    comments: [
      {
        id: 'c3',
        user: sampleUsers[3],
        content: 'Add this to my bucket list! 📝',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        likes: 8,
        liked: true,
      },
    ],
    shares: 23,
    liked: true,
    bookmarked: true,
  },
  {
    id: '3',
    user: sampleUsers[1],
    content: `Big news! 🎉 

I'm thrilled to announce that I've just accepted a position as Senior Software Engineer at a leading tech company! 

This journey has been incredible, and I couldn't have done it without the support of this amazing community. Thank you all for your encouragement and advice along the way.

Here's to new beginnings! 🚀`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    likes: 1243,
    comments: [
      {
        id: 'c4',
        user: sampleUsers[0],
        content: 'Congratulations James! So well deserved! 🎊',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        likes: 34,
        liked: false,
      },
      {
        id: 'c5',
        user: sampleUsers[4],
        content: 'Amazing news! Best of luck in your new role! 💪',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        likes: 21,
        liked: false,
      },
      {
        id: 'c6',
        user: currentUser,
        content: 'This is awesome! Knew you\'d make it. Let\'s celebrate soon!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        likes: 15,
        liked: false,
      },
    ],
    shares: 89,
    liked: false,
    bookmarked: false,
  },
  {
    id: '4',
    user: sampleUsers[2],
    content: `Weekend hiking adventure! 🏔️

Nothing beats the feeling of reaching the summit after a challenging climb. The view from up here is absolutely breathtaking.

Remember: the journey is just as important as the destination.`,
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop',
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    likes: 892,
    comments: [],
    shares: 67,
    liked: false,
    bookmarked: false,
  },
  {
    id: '5',
    user: sampleUsers[3],
    content: `Pro tip for developers: 💡

Always write code as if the person who ends up maintaining it is a violent psychopath who knows where you live.

Just kidding... but seriously, write clean code. Your future self will thank you!

#programming #codinglife #softwaredevelopment`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    likes: 2341,
    comments: [
      {
        id: 'c7',
        user: sampleUsers[1],
        content: 'This hit way too close to home 😅',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        likes: 156,
        liked: true,
      },
    ],
    shares: 234,
    liked: true,
    bookmarked: true,
  },
];

