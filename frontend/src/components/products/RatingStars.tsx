import type { RatingStarsProps } from '../../types/product';

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function RatingStars({
  rating,
  maxRating = 5,
  reviewCount,
  size = 'md',
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`Rating: ${rating} out of ${maxRating} stars${reviewCount ? `, ${reviewCount} reviews` : ''}`}>
      <div className="flex items-center gap-0.5">
        {/* Full Stars */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <svg
            key={`full-${index}`}
            className={`${sizeClasses[size]} text-amber-400 fill-current`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <svg
            className={`${sizeClasses[size]} text-amber-400`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="halfGradient">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path
              fill="url(#halfGradient)"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        )}

        {/* Empty Stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <svg
            key={`empty-${index}`}
            className={`${sizeClasses[size]} text-gray-300 fill-current`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>

      {reviewCount !== undefined && (
        <span className={`${textSizeClasses[size]} text-slate-500 font-medium`}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}





