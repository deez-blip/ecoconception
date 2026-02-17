import { MessageDisplay } from '@/components/common';
import { ProductShowcaseGrid } from '@/components/product';
import { useDocumentTitle, useRecommendedProducts, useScrollTop } from '@/hooks';
import bannerGirlSmallFallback from '@/images/optimized/banner-girl-1-fallback.jpg';
import bannerGirlSmallAvif320 from '@/images/optimized/banner-girl-1-320.avif';
import bannerGirlSmallAvif420 from '@/images/optimized/banner-girl-1-420.avif';
import bannerGirlSmallWebp320 from '@/images/optimized/banner-girl-1-320.webp';
import bannerGirlSmallWebp420 from '@/images/optimized/banner-girl-1-420.webp';
import React from 'react';

const RecommendedProducts = () => {
  useDocumentTitle('Recommended Products | Salinaka');
  useScrollTop();

  const {
    recommendedProducts,
    fetchRecommendedProducts,
    isLoading,
    error
  } = useRecommendedProducts();

  return (
    <main className="content">
      <div className="featured">
        <div className="banner">
          <div className="banner-desc">
            <h1>Recommended Products</h1>
          </div>
          <div className="banner-img">
            <picture>
              <source
                sizes="(max-width: 768px) 100vw, 50vw"
                srcSet={`${bannerGirlSmallAvif320} 320w, ${bannerGirlSmallAvif420} 420w`}
                type="image/avif"
              />
              <source
                sizes="(max-width: 768px) 100vw, 50vw"
                srcSet={`${bannerGirlSmallWebp320} 320w, ${bannerGirlSmallWebp420} 420w`}
                type="image/webp"
              />
              <img
                alt="Femme avec lunettes dans la bannière des recommandations"
                decoding="async"
                fetchPriority="high"
                height="360"
                loading="eager"
                src={bannerGirlSmallFallback}
                width="420"
              />
            </picture>
          </div>
        </div>
        <div className="display">
          <div className="product-display-grid">
            {(error && !isLoading) ? (
              <MessageDisplay
                message={error}
                action={fetchRecommendedProducts}
                buttonLabel="Try Again"
              />
            ) : (
              <ProductShowcaseGrid
                products={recommendedProducts}
                skeletonCount={6}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default RecommendedProducts;
