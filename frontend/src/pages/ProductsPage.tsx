import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '../components/products/ProductCard';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../types/product';

const sampleProducts: Product[] = [
  {
    id: '1',
    title: 'Premium Wireless Headphones',
    description: 'Experience crystal-clear audio with active noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
    price: 249.99,
    originalPrice: 349.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    rating: 4.8,
    reviewCount: 2847,
    inStock: true,
  },
  {
    id: '2',
    title: 'Minimalist Leather Watch',
    description: 'Elegant timepiece with genuine Italian leather strap and sapphire crystal glass. Water-resistant up to 50 meters.',
    price: 189.00,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    rating: 4.5,
    reviewCount: 1203,
    inStock: true,
  },
  {
    id: '3',
    title: 'Smart Fitness Tracker Pro',
    description: 'Track your health metrics 24/7 with heart rate monitoring, sleep analysis, and GPS. Syncs seamlessly with your devices.',
    price: 129.99,
    originalPrice: 179.99,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop',
    rating: 4.3,
    reviewCount: 892,
    inStock: true,
  },
  {
    id: '4',
    title: 'Portable Bluetooth Speaker',
    description: 'Powerful 360° sound in a compact design. IPX7 waterproof rating makes it perfect for outdoor adventures.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
    rating: 4.6,
    reviewCount: 3421,
    inStock: true,
  },
  {
    id: '5',
    title: 'Ergonomic Mechanical Keyboard',
    description: 'Premium typing experience with hot-swappable switches, RGB backlighting, and programmable macros for productivity.',
    price: 159.00,
    originalPrice: 199.00,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&h=600&fit=crop',
    rating: 4.9,
    reviewCount: 567,
    inStock: true,
  },
  {
    id: '6',
    title: 'Vintage Polaroid Camera',
    description: 'Capture moments instantly with this retro-styled instant camera. Includes built-in flash and self-timer function.',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop',
    rating: 4.2,
    reviewCount: 445,
    inStock: false,
  },
  {
    id: '7',
    title: 'Ultra-thin Laptop Stand',
    description: 'Ergonomic aluminum laptop stand with adjustable height. Improves posture and keeps your device cool.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop',
    rating: 4.4,
    reviewCount: 789,
    inStock: true,
  },
  {
    id: '8',
    title: 'Wireless Charging Pad',
    description: 'Fast 15W wireless charging for all Qi-compatible devices. Sleek design with LED indicator.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=600&h=600&fit=crop',
    rating: 4.1,
    reviewCount: 1456,
    inStock: true,
  },
  {
    id: '9',
    title: 'Noise-Canceling Earbuds',
    description: 'True wireless earbuds with active noise cancellation. 24-hour battery with charging case.',
    price: 149.99,
    originalPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop',
    rating: 4.7,
    reviewCount: 2103,
    inStock: true,
  },
];

const ITEMS_PER_PAGE = 3;

export function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart } = useCart();

  // Listen for hash changes to reset search when navigating to /products
  useEffect(() => {
    const handleHashChange = () => {
      // If navigated to /products without search, clear the search
      const hash = window.location.hash;
      if (hash === '#/products' || hash === '#/products/') {
        setSearchQuery('');
        setCurrentPage(1);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sampleProducts;
    
    return sampleProducts.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative z-10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Search */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            All Products
          </h1>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md" role="search">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl
                          border-2 border-slate-200 dark:border-slate-700
                          bg-white dark:bg-slate-800
                          text-slate-900 dark:text-white
                          placeholder:text-slate-400 dark:placeholder:text-slate-500
                          focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                          transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 
                            text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </form>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
                className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg
                           text-slate-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Best Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6" role="status" aria-live="polite">
          <p className="text-slate-600 dark:text-slate-400">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Product Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          role="list"
          aria-label="Product list"
        >
          {paginatedProducts.map((product, index) => (
            <div
              key={product.id}
              role="listitem"
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No products found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Try adjusting your search or filter to find what you're looking for.</p>
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 
                        hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium rounded-lg
                        text-slate-600 dark:text-slate-400
                        hover:bg-slate-100 dark:hover:bg-slate-800
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors"
              aria-label="Previous page"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors
                          ${currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium rounded-lg
                        text-slate-600 dark:text-slate-400
                        hover:bg-slate-100 dark:hover:bg-slate-800
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors"
              aria-label="Next page"
            >
              Next
            </button>

            <span className="ml-4 text-sm text-slate-500 dark:text-slate-400">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length}
            </span>
          </nav>
        )}
      </div>
    </section>
  );
}





