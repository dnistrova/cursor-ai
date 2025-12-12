import { Link } from 'react-router-dom';

const categories = [
  { id: '1', name: 'Electronics', count: 1240, icon: '🎧', color: 'from-blue-500 to-cyan-500' },
  { id: '2', name: 'Fashion', count: 856, icon: '👗', color: 'from-pink-500 to-rose-500' },
  { id: '3', name: 'Home & Living', count: 643, icon: '🏠', color: 'from-amber-500 to-orange-500' },
  { id: '4', name: 'Sports', count: 421, icon: '⚽', color: 'from-green-500 to-emerald-500' },
];

export function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative z-10 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full mb-4 animate-fadeInUp">
              ✨ New Season Collection
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
              Discover Products That{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Inspire
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              Curated collection of premium products designed for modern living. 
              Shop the latest trends with free shipping on orders over $50.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '300ms' }}>
              <Link
                to="/products"
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 
                          hover:from-indigo-500 hover:to-violet-500
                          text-white font-semibold rounded-xl
                          shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40
                          transform hover:scale-[1.02] transition-all duration-200"
              >
                Shop Now
              </Link>
              <Link
                to="/categories"
                className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700
                          text-slate-700 dark:text-slate-200 font-semibold rounded-xl
                          border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500
                          transform hover:scale-[1.02] transition-all duration-200"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Shop by Category
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Find exactly what you're looking for
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to="/products"
                className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl
                          dark:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 mb-4 rounded-xl bg-gradient-to-br ${category.color}
                                flex items-center justify-center text-2xl
                                group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {category.count.toLocaleString()} products
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 sm:p-12">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative z-10 max-w-xl">
              <span className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full mb-4">
                🔥 Limited Time Offer
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Summer Sale Up to 50% Off
              </h2>
              <p className="text-indigo-100 mb-6">
                Don't miss out on our biggest sale of the year. Premium products at unbeatable prices.
              </p>
              <Link
                to="/deals"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 
                          font-semibold rounded-xl hover:bg-indigo-50 transition-colors duration-200"
              >
                Shop the Sale
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}





