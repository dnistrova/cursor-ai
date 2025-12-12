import { Link } from 'react-router-dom';

const categories = [
  { id: '1', name: 'Electronics', count: 1240, icon: '🎧', color: 'from-blue-500 to-cyan-500', description: 'Latest gadgets and tech accessories' },
  { id: '2', name: 'Fashion', count: 856, icon: '👗', color: 'from-pink-500 to-rose-500', description: 'Trendy clothing and accessories' },
  { id: '3', name: 'Home & Living', count: 643, icon: '🏠', color: 'from-amber-500 to-orange-500', description: 'Furniture and home decor' },
  { id: '4', name: 'Sports', count: 421, icon: '⚽', color: 'from-green-500 to-emerald-500', description: 'Equipment and athletic wear' },
  { id: '5', name: 'Beauty', count: 532, icon: '💄', color: 'from-purple-500 to-fuchsia-500', description: 'Skincare and cosmetics' },
  { id: '6', name: 'Books', count: 1893, icon: '📚', color: 'from-teal-500 to-cyan-500', description: 'Fiction, non-fiction, and more' },
  { id: '7', name: 'Toys & Games', count: 367, icon: '🎮', color: 'from-red-500 to-orange-500', description: 'Fun for all ages' },
  { id: '8', name: 'Automotive', count: 298, icon: '🚗', color: 'from-slate-500 to-zinc-500', description: 'Parts and accessories' },
];

export function CategoriesPage() {
  return (
    <section className="relative z-10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Browse Categories
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore our wide range of product categories and find exactly what you're looking for
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to="/products"
              className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl
                        dark:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1 animate-fadeInUp
                        overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 
                              group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className={`w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br ${category.color}
                                flex items-center justify-center text-3xl
                                group-hover:scale-110 transition-transform duration-300
                                shadow-lg`}>
                  {category.icon}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 
                              group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {category.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {category.count.toLocaleString()} products
                  </span>
                  <svg 
                    className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 
                              transform group-hover:translate-x-1 transition-all duration-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}





