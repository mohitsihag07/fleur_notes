'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Grid, List, ChevronLeft, ChevronRight, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/shop/ProductCard';
import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { bannerService } from '@/services/bannerService';
import { productService } from '@/services/productService';
import { getFormattedImage } from '@/utils/formatImage';
import { getBackendURL } from '@/services/api';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 20 });
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ colors: [], priceRange: null, minRating: 0 });

  const [banner, setBanner] = useState({
    title: '',
    description: '',
    tagline: '',
    image: ''
  });

  // Read URL params (category, type, filter, page) on load / change
  useEffect(() => {
    const cat = searchParams.get('category');
    const rawType = searchParams.get('type') || searchParams.get('filter');
    const pageParam = parseInt(searchParams.get('page') || '1', 10);

    if (rawType) {
      if (['best-sellers', 'bestseller', 'bestsellers', 'best_seller'].includes(rawType)) {
        setActiveCategory('bestsellers');
      } else if (['new-arrivals', 'new', 'new_arrival'].includes(rawType)) {
        setActiveCategory('new-arrivals');
      } else {
        setActiveCategory(rawType);
      }
    } else if (cat) {
      setActiveCategory(cat);
    } else {
      setActiveCategory('all');
    }

    if (pageParam > 0) {
      setCurrentPage(pageParam);
    }
  }, [searchParams]);

  // Helper to update URL query params when page or category changes
  const updateUrlParams = (newCategory, newPage) => {
    const params = new URLSearchParams();
    if (newCategory && newCategory !== 'all') {
      const isType = ['featured', 'bestsellers', 'best-sellers', 'new-arrivals'].includes(newCategory);
      if (isType) {
        params.set('type', newCategory);
      } else {
        params.set('category', newCategory);
      }
    }
    if (newPage > 1) {
      params.set('page', newPage.toString());
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    router.push(`/shop${queryString}`, { scroll: false });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > meta.totalPages) return;
    setCurrentPage(newPage);
    updateUrlParams(activeCategory, newPage);
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
    updateUrlParams(category, 1);
  };

  // Fetch shop banner & paginated products from backend
  useEffect(() => {
    async function loadShopData() {
      setLoadingProducts(true);
      try {
        const isType = ['featured', 'bestsellers', 'new-arrivals'].includes(activeCategory);
        const categoryParam = activeCategory !== 'all' && !isType ? activeCategory : '';
        const typeParam = isType ? activeCategory : '';

        const [fetchedBanners, response] = await Promise.all([
          bannerService.getBanners({ limit: 1, type: 'shop' }),
          productService.getProducts({
            page: currentPage,
            limit: 20,
            category: categoryParam,
            type: typeParam,
            status: 'active'
          })
        ]);

        if (fetchedBanners && fetchedBanners.length > 0) {
          const b = fetchedBanners[0];
          const backendUrl = getBackendURL();
          let imgUrl = b.image || '';
          if (imgUrl.includes('localhost:') || imgUrl.includes('127.0.0.1:')) {
            try {
              const urlObj = new URL(imgUrl);
              imgUrl = urlObj.pathname;
            } catch (e) {
              imgUrl = imgUrl.replace(/^https?:\/\/[^\/]+/, '');
            }
          }
          if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('data:')) {
            const path = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
            imgUrl = `${backendUrl}${path}`;
          }
          setBanner({
            title: b.title || 'Shop Our Collection',
            description: b.description || 'Handcrafted with love, made for you.',
            tagline: b.tagline || '',
            image: imgUrl,
            primary_cta_text: b.primary_cta_text || b.button_text,
            primary_cta_link: b.primary_cta_link || b.button_link,
            secondary_cta_text: b.secondary_cta_text,
            secondary_cta_link: b.secondary_cta_link,
          });
        }

        const realProducts = response?.data || [];
        const fetchedMeta = response?.meta || { totalItems: realProducts.length, totalPages: 1, currentPage: 1, limit: 20 };
        setMeta(fetchedMeta);

        if (Array.isArray(realProducts) && realProducts.length > 0) {
          const formatted = realProducts.map((p, idx) => {
            let rawImg = null;
            if (p.images && p.images.length > 0) {
              const thumb = p.images.find((img) => img.is_thumbnail) || p.images[0];
              rawImg = thumb?.image;
            } else if (p.image) {
              rawImg = p.image;
            }

            return {
              id: p.id || p._id || `prod-${idx}`,
              name: p.name,
              slug: p.slug || p.id || p._id,
              price: p.sale_price ? parseFloat(p.sale_price) : parseFloat(p.price || 0),
              originalPrice: p.sale_price ? parseFloat(p.price) : null,
              image: getFormattedImage(rawImg),
              isFeatured: Boolean(p.is_featured),
              isNew: Boolean(p.is_new_arrival || p.is_new),
              isBestSeller: Boolean(p.is_best_seller || p.is_bestseller),
              rating: p.rating || 4.9,
              reviewsCount: p.reviews_count || 48,
              category: p.category?.name || 'General',
              color: p.color || '',
              description: p.description
            };
          });
          setProducts(formatted);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to load shop data:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadShopData();
  }, [currentPage, activeCategory]);

  return (
    <div className="bg-[#FAF5EF] min-h-screen">
      {/* Hero Header Banner */}
      <section className="relative overflow-hidden w-full min-h-[320px] sm:min-h-[380px] lg:min-h-[440px] border-b border-[#E8DACD]/40 bg-[#FAF5EF] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={banner.image}
            alt={banner.title || 'Shop Banner'}
            fill
            unoptimized
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
        </div>

        <Container className="relative z-10 w-full py-10 sm:py-16">
          <div className="max-w-xl md:max-w-2xl flex flex-col items-start space-y-3 sm:space-y-4 text-white">
            <nav className="text-[11px] sm:text-xs text-gray-200 font-semibold flex items-center gap-1.5 sm:gap-2">
              <Link href="/" className="hover:text-white hover:underline">Home</Link>
              <span>›</span>
              <span className="text-[#FAF5EF] font-bold">Shop</span>
            </nav>
            {banner.tagline && (
              <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest text-[#FAF5EF] uppercase bg-black/40 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
                <span>{banner.tagline}</span>
              </div>
            )}
            {banner.title && (
              <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
                {banner.title}
              </h1>
            )}
            {banner.description && (
              <p className="text-xs sm:text-base lg:text-lg text-gray-100 font-medium leading-normal sm:leading-relaxed max-w-lg drop-shadow">
                {banner.description}
              </p>
            )}

            {/* Dynamic CTAs */}
            {(banner.primary_cta_text || banner.secondary_cta_text) && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {banner.primary_cta_text && (
                  <Link href={banner.primary_cta_link || '#products'}>
                    <Button variant="primary" icon={Sparkles} iconPosition="right" className="rounded-xl px-6 py-3 bg-[#7A0C1E] hover:bg-[#5F0917] text-white">
                      {banner.primary_cta_text}
                    </Button>
                  </Link>
                )}
                {banner.secondary_cta_text && (
                  <Link href={banner.secondary_cta_link || '#'}>
                    <Button variant="outline" className="rounded-xl px-6 py-3 bg-white/20 hover:bg-white/30 text-white border-white/40 backdrop-blur-xs">
                      {banner.secondary_cta_text}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Shop Content Section */}
      <section className="py-12 bg-[#FAF5EF]">
        <Container>
          {/* Mobile Filter Button Bar */}
          <div className="flex items-center justify-between gap-4 mb-6 lg:hidden">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#F2E6DA] border border-[#E8DACD] rounded-xl text-xs font-semibold text-[#2B1B17]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#7A0C1E]" />
              <span>Filter</span>
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 py-2.5 px-4 bg-[#F2E6DA] border border-[#E8DACD] rounded-xl text-xs font-semibold text-[#2B1B17] outline-none"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Desktop Left Filter Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <FilterSidebar
                activeCategory={activeCategory}
                onSelectCategory={handleCategorySelect}
                filters={filters}
                onFiltersChange={setFilters}
                products={products}
              />
            </div>

            {/* Mobile Filter Drawer Overlay */}
            {mobileFilterOpen && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl p-6 relative border border-[#E8DACD]">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h3 className="font-bold text-base text-[#2B1B17]">Filter Products</h3>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="text-xs font-semibold text-gray-500"
                    >
                      Close ✕
                    </button>
                  </div>
                  <FilterSidebar
                    activeCategory={activeCategory}
                    onSelectCategory={(cat) => {
                      handleCategorySelect(cat);
                      setMobileFilterOpen(false);
                    }}
                    filters={filters}
                    onFiltersChange={setFilters}
                    products={products}
                  />
                </div>
              </div>
            )}

            {/* Right Main Product Area */}
            <div className="lg:col-span-9">
              {/* Sort & Counter Bar */}
              <div className="hidden lg:flex items-center justify-between pb-6 mb-6 border-b border-[#E8DACD]/60">
                <span className="text-xs font-medium text-[#705B54]">
                  {meta.totalItems > 0 ? (
                    <>Showing {Math.min((currentPage - 1) * 20 + 1, meta.totalItems)}–{Math.min(currentPage * 20, meta.totalItems)} of {meta.totalItems} products</>
                  ) : (
                    <>No products found</>
                  )}
                </span>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#705B54] font-medium">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="py-1.5 px-3 bg-[#F2E6DA] border border-[#E8DACD] rounded-lg text-xs font-medium text-[#2B1B17] outline-none cursor-pointer"
                    >
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="popular">Popularity</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 border-l border-[#E8DACD] pl-4">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        viewMode === 'grid' ? 'bg-[#7A0C1E] text-white' : 'text-gray-400 hover:text-[#2B1B17]'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                        viewMode === 'list' ? 'bg-[#7A0C1E] text-white' : 'text-gray-400 hover:text-[#2B1B17]'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Grid / List container */}
              {loadingProducts ? (
                <div className="flex items-center justify-center py-16 text-[#7A0C1E]">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span className="text-sm font-bold">Loading Products...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 text-[#705B54]">
                  <p className="text-base font-semibold">No products found matching your selection.</p>
                </div>
              ) : (
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                  : "flex flex-col gap-4"
                }>
                  {products
                    .filter((product) => {
                      // ── Price range filter ──
                      if (filters.priceRange) {
                        const { min, max } = filters.priceRange;
                        if (min > 0 || max < 10000) {
                          if (product.price < min || product.price > max) return false;
                        }
                      }

                      // ── Rating filter ──
                      if (filters.minRating > 0) {
                        if ((product.rating || 0) < filters.minRating) return false;
                      }

                      // ── Color filter ──
                      if (filters.colors && filters.colors.length > 0) {
                        const productColor = (product.color || product.colour || '').toLowerCase();
                        const matched = filters.colors.some(c => productColor.includes(c.toLowerCase()));
                        if (!matched) return false;
                      }

                      return true;
                    })
                    .sort((a, b) => {
                      if (sortBy === 'price-low')  return a.price - b.price;
                      if (sortBy === 'price-high') return b.price - a.price;
                      if (sortBy === 'newest')     return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
                      if (sortBy === 'popular')    return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
                      return 0;
                    })
                    .map((product, idx) => (
                      <ProductCard key={product.id || product._id || `prod-${idx}`} product={product} layout={viewMode} />
                    ))}
                </div>
              )}

              {/* Dynamic Pagination Controls */}
              {meta.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-2 rounded-lg border border-[#E8DACD] text-[#2B1B17] disabled:opacity-40 hover:bg-[#F2E6DA] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-[#7A0C1E] text-white shadow-sm'
                          : 'border border-[#E8DACD] text-[#2B1B17] hover:bg-[#F2E6DA]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    disabled={currentPage >= meta.totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-2 rounded-lg border border-[#E8DACD] text-[#2B1B17] disabled:opacity-40 hover:bg-[#F2E6DA] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen text-[#7A0C1E]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
