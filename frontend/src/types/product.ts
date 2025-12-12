export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  inStock?: boolean;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
}





