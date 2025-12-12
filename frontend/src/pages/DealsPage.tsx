import { ProductCard } from '../components/products/ProductCard';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../types/product';

const dealProducts: Product[] = [
  {
    id: '1',
    title: 'Premium Wireless Headphones',
    description: 'Experience crystal-clear audio with active noise cancellation and 30-hour battery life.',
    price: 249.99,
    originalPrice: 349.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    rating: 4.8,
    reviewCount: 2847,
    inStock: true,
  },
  {
    id: '3',
    title: 'Smart Fitness Tracker Pro',
    description: 'Track your health metrics 24/7 with heart rate monitoring, sleep analysis, and GPS.',
    price: 129.99,
    originalPrice: 179.99,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop',
    rating: 4.3,
    reviewCount: 892,
    inStock: true,
  },
  {
    id: '5',
    title: 'Ergonomic Mechanical Keyboard',
    description: 'Premium typing experience with hot-swappable switches and RGB backlighting.',
    price: 159.00,
    originalPrice: 199.00,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&h=600&fit=crop',
    rating: 4.9,
    reviewCount: 567,
    inStock: true,
  },
];

export function DealsPage() {
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  return (
    <section className="relative z-10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 sm:p-12 mb-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative z-10 text-center">
            <span className="inline-block px-4 py-1.5 bg-white/20 text-white text-sm font-medium rounded-full mb-4">
              🔥 Limited Time Only
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Summer Sale
            </h1>
            <p className="text-xl text-indigo-100 mb-6 max-w-2xl mx-auto">
              Up to 50% off on selected items. Don't miss out on our biggest sale of the year!
            </p>
            <div className="flex justify-center gap-8 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">02</div>
                <div className="text-sm text-indigo-200">Days</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">14</div>
                <div className="text-sm text-indigo-200">Hours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">36</div>
                <div className="text-sm text-indigo-200">Minutes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Deal Products */}
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Top Deals
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {dealProducts.length} products on sale
          </p>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          role="list"
          aria-label="Deal products"
        >
          {dealProducts.map((product, index) => (
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

        {/* Newsletter */}
        <div className="mt-16 text-center">
          <div className="max-w-md mx-auto p-8 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Don't Miss a Deal
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Subscribe to get notified about new deals and promotions
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 
                          bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold 
                          rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}





