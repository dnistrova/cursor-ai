import { Feed } from '../components/social/Feed';
import { samplePosts, currentUser } from '../data/sampleData';

export function SocialFeedPage() {
  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Social Feed
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Share updates, connect with your team, and stay in the loop
          </p>
        </div>
        <Feed initialPosts={samplePosts} currentUser={currentUser} />
      </div>
    </div>
  );
}

