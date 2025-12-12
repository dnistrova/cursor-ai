import { useState } from 'react';
import type { ProductCardProps } from '../../types/product';
import { RatingStars } from './RatingStars';

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    // Simulate adding to cart
    await new Promise(resolve => setTimeout(resolve, 600));
    
    onAddToCart?.(product);
    setIsAddingToCart(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <article
      className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden
                 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]
                 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)]
                 transition-all duration-500 ease-out
                 hover:-translate-y-1"
      aria-labelledby={`product-title-${product.id}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {/* Loading skeleton */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse" />
        )}
        
        <img
          src={product.image}
          alt={product.title}
          className={`w-full h-full object-cover transition-all duration-700 ease-out
                     group-hover:scale-110
                     ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 bg-rose-500 text-white 
                       text-xs font-bold rounded-full shadow-lg
                       animate-[pulse_2s_ease-in-out_infinite]"
            aria-label={`${discountPercentage}% off`}
          >
            -{discountPercentage}%
          </span>
        )}

        {/* Out of Stock Overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="px-4 py-2 bg-white text-slate-900 font-semibold rounded-lg text-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick View Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300
                     flex items-end justify-center pb-4"
        >
          <button
            type="button"
            className="px-4 py-2 bg-white/95 text-slate-900 text-sm font-medium rounded-lg
                       transform translate-y-4 group-hover:translate-y-0
                       transition-all duration-300 delay-100
                       hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label={`Quick view ${product.title}`}
          >
            Quick View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Rating */}
        <div className="mb-2">
          <RatingStars
            rating={product.rating}
            reviewCount={product.reviewCount}
            size="sm"
          />
        </div>

        {/* Title */}
        <h3
          id={`product-title-${product.id}`}
          className="text-slate-900 font-semibold text-base sm:text-lg leading-tight mb-1.5
                     line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300"
        >
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Price & Add to Cart */}
        <div className="flex flex-col gap-3 mt-auto">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.inStock === false || isAddingToCart}
            className="relative flex items-center justify-center gap-2 
                       w-full py-2.5 sm:py-3
                       bg-gradient-to-r from-indigo-600 to-violet-600 
                       hover:from-indigo-500 hover:to-violet-500
                       text-white text-sm font-semibold rounded-xl
                       shadow-[0_4px_14px_-3px_rgba(99,102,241,0.5)]
                       hover:shadow-[0_6px_20px_-3px_rgba(99,102,241,0.6)]
                       transform hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-200 ease-out
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       disabled:hover:scale-100 disabled:hover:shadow-none
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label={`Add ${product.title} to cart`}
            aria-busy={isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 transition-transform group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

