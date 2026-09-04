import React from 'react';
import { Product } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency } from '../../lib/utils';

export interface ProductCardProps {
  product: Product;
  isRecommended?: boolean;
  onSelect?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  ctaText?: string;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isRecommended = false,
  onSelect,
  onAddToCart,
  ctaText = 'Add to Cart & Delegate',
  className,
}) => {
  return (
    <div
      className={`group relative flex flex-col bg-surface-container-lowest border rounded-xl overflow-hidden shadow-L1 hover:shadow-L2 transition-all duration-200 ${
        isRecommended
          ? 'border-secondary/30 ring-1 ring-secondary/20'
          : 'border-outline-variant/30'
      } ${className || ''}`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-low">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isRecommended && (
            <Badge variant="score" size="sm" icon="auto_awesome">
              Top Agent Match {product.matchScore}%
            </Badge>
          )}
          {!isRecommended && product.matchScore && (
            <Badge variant="info" size="sm">
              {product.matchScore}% Match
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container-lowest/90 text-on-surface-variant backdrop-blur-sm border border-outline-variant/20 shadow-sm">
            {product.sku}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-space-20">
        <div className="mb-2">
          <div className="flex items-center justify-between text-label-sm text-on-surface-variant mb-1">
            <span className="font-semibold uppercase tracking-wider text-on-surface-variant/80">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-amber-600 font-mono font-medium text-[12px]">
              <span className="material-symbols-outlined fill text-[14px]">star</span>
              <span>{product.rating}</span>
              <span className="text-on-surface-variant">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-headline text-headline-sm font-bold text-on-surface line-clamp-1 group-hover:text-secondary transition-colors">
            {product.name}
          </h3>
          <p className="text-body-sm text-on-surface-variant line-clamp-1">{product.subtitle}</p>
        </div>

        {/* Specs Highlights */}
        {product.specs && (
          <div className="grid grid-cols-2 gap-1.5 py-2.5 my-2 border-y border-surface-container-high text-label-sm">
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">scale</span>
              <span className="truncate">{product.specs.weight}</span>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">terrain</span>
              <span className="truncate">{product.specs.terrain}</span>
            </div>
          </div>
        )}

        {/* Merchant Offer applied */}
        {product.merchantOffer && (
          <div className="mb-3">
            <Badge variant="verified" size="sm" icon="verified">
              {product.merchantOffer.code}: -{formatCurrency(product.merchantOffer.discountAmount)}
            </Badge>
          </div>
        )}

        {/* Price & CTA */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-3">
          <div>
            <div className="font-mono text-headline-sm font-bold text-on-surface">
              {formatCurrency(product.finalPrice)}
            </div>
            {product.originalPrice > product.finalPrice && (
              <div className="text-body-sm font-mono text-on-surface-variant line-through">
                {formatCurrency(product.originalPrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onAddToCart ? (
              <Button
                variant={isRecommended ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onAddToCart(product)}
                iconLeft="shopping_bag"
              >
                {ctaText}
              </Button>
            ) : onSelect ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(product)}
                iconRight="arrow_forward"
              >
                View
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
