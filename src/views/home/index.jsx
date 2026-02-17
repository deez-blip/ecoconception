import { MessageDisplay } from '@/components/common';
import { ProductShowcaseGrid } from '@/components/product';
import { FEATURED_PRODUCTS, RECOMMENDED_PRODUCTS, SHOP } from '@/constants/routes';
import {
  useDocumentTitle, useFeaturedProducts, useRecommendedProducts, useScrollTop
} from '@/hooks';
import bannerGirlFallback from '@/images/optimized/banner-girl-fallback.jpg';
import bannerGirlAvif480 from '@/images/optimized/banner-girl-480.avif';
import bannerGirlAvif768 from '@/images/optimized/banner-girl-768.avif';
import bannerGirlAvif1279 from '@/images/optimized/banner-girl-1279.avif';
import bannerGirlWebp480 from '@/images/optimized/banner-girl-480.webp';
import bannerGirlWebp768 from '@/images/optimized/banner-girl-768.webp';
import bannerGirlWebp1279 from '@/images/optimized/banner-girl-1279.webp';
import React from 'react';
import { Link } from 'react-router-dom';


const Home = () => {
  useDocumentTitle('Salinaka | Home');
  useScrollTop();

  const {
    featuredProducts,
    fetchFeaturedProducts,
    isLoading: isLoadingFeatured,
    error: errorFeatured
  } = useFeaturedProducts(6);
  const {
    recommendedProducts,
    fetchRecommendedProducts,
    isLoading: isLoadingRecommended,
    error: errorRecommended
  } = useRecommendedProducts(6);

  return (
    <main className="content">
      <div className="home">
        <div className="banner">
          <div className="banner-desc">
            <h1 className="text-thin">
              <strong>See</strong>
              &nbsp;everything with&nbsp;
              <strong>Clarity</strong>
            </h1>
            <p>
              Buying eyewear should leave you happy and good-looking, with money in your pocket.
              Glasses, sunglasses, and contacts—we’ve got your eyes covered.
            </p>
            <br />
            <Link to={SHOP} className="button">
              Shop Now &nbsp;
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="banner-img">
            <picture>
              <source
                sizes="(max-width: 768px) 100vw, 50vw"
                srcSet={`${bannerGirlAvif480} 480w, ${bannerGirlAvif768} 768w, ${bannerGirlAvif1279} 1279w`}
                type="image/avif"
              />
              <source
                sizes="(max-width: 768px) 100vw, 50vw"
                srcSet={`${bannerGirlWebp480} 480w, ${bannerGirlWebp768} 768w, ${bannerGirlWebp1279} 1279w`}
                type="image/webp"
              />
              <img
                alt="Femme portant des lunettes dans la bannière d'accueil"
                decoding="async"
                fetchPriority="high"
                height="800"
                loading="eager"
                src={bannerGirlFallback}
                width="1279"
              />
            </picture>
          </div>
        </div>
        <div className="display">
          <div className="display-header">
            <h1>Featured Products</h1>
            <Link to={FEATURED_PRODUCTS}>See All</Link>
          </div>
          {(errorFeatured && !isLoadingFeatured) ? (
            <MessageDisplay
              message={errorFeatured}
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
        <div className="display">
          <div className="display-header">
            <h1>Recommended Products</h1>
            <Link to={RECOMMENDED_PRODUCTS}>See All</Link>
          </div>
          {(errorRecommended && !isLoadingRecommended) ? (
            <MessageDisplay
              message={errorRecommended}
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
    </main>
  );
};

export default Home;
