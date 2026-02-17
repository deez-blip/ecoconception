import { MessageDisplay } from '@/components/common';
import { ProductShowcaseGrid } from '@/components/product';
import { useDocumentTitle, useFeaturedProducts, useScrollTop } from '@/hooks';
import bannerGuyFallback from '@/images/optimized/banner-guy-fallback.jpg';
import bannerGuyAvif320 from '@/images/optimized/banner-guy-320.avif';
import bannerGuyAvif560 from '@/images/optimized/banner-guy-560.avif';
import bannerGuyAvif766 from '@/images/optimized/banner-guy-766.avif';
import bannerGuyWebp320 from '@/images/optimized/banner-guy-320.webp';
import bannerGuyWebp560 from '@/images/optimized/banner-guy-560.webp';
import bannerGuyWebp766 from '@/images/optimized/banner-guy-766.webp';
import React from 'react';

const FeaturedProducts = () => {
  useDocumentTitle('Featured Products | Salinaka');
  useScrollTop();

  const {
    featuredProducts,
    fetchFeaturedProducts,
    isLoading,
    error
  } = useFeaturedProducts();

  return (
    <main className="content">
      <div className="featured">
        <div className="banner">
          <div className="banner-desc">
            <h1>Featured Products</h1>
          </div>
          <div className="banner-img">
            <picture>
              <source
                sizes="(max-width: 768px) 100vw, 50vw"
                srcSet={`${bannerGuyAvif320} 320w, ${bannerGuyAvif560} 560w, ${bannerGuyAvif766} 766w`}
                type="image/avif"
              />
              <source
                sizes="(max-width: 768px) 100vw, 50vw"
                srcSet={`${bannerGuyWebp320} 320w, ${bannerGuyWebp560} 560w, ${bannerGuyWebp766} 766w`}
                type="image/webp"
              />
              <img
                alt="Homme portant des lunettes dans la bannière des produits vedettes"
                decoding="async"
                fetchPriority="high"
                height="742"
                loading="eager"
                src={bannerGuyFallback}
                width="766"
              />
            </picture>
          </div>
        </div>
        <div className="display">
          <div className="product-display-grid">
            {(error && !isLoading) ? (
              <MessageDisplay
                message={error}
                action={fetchFeaturedProducts}
                buttonLabel="Try Again"
              />
            ) : (
              <ProductShowcaseGrid
                products={featuredProducts}
                skeletonCount={6}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default FeaturedProducts;
