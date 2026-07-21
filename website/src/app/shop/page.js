'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Filter, Grid, List, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/shop/ProductCard';
import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { featuredProducts } from '@/data/products';

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="bg-[#FAF5EF] min-h-screen">
      {/* Hero Header Banner */}
      <section className="relative bg-[#F2E6DA] py-12 lg:py-16 border-b border-[#E8DACD]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-3">
              <nav className="text-xs text-gray-500 flex items-center gap-2">
                <Link href="/" className="hover:text-[#7A0C1E]">Home</Link>
                <span>›</span>
                <span className="text-[#7A0C1E] font-medium">Shop</span>
              </nav>
              <h1 className="font-serif-luxury text-4xl sm:text-5xl font-bold text-[#2B1B17] tracking-tight">
                Shop Our Collection
              </h1>
              <p className="text-sm sm:text-base text-[#705B54]">
                Handcrafted with love, made for you.
              </p>
            </div>

            <div className="lg:col-span-6 relative aspect-[16/9] lg:aspect-[3/1] rounded-2xl overflow-hidden shadow-sm border border-[#E8DACD]">
              <Image
                src="/images/banners/hero_banner.jpg"
                alt="Shop Collection"
                fill
                className="object-cover"
                priority
              />
            </div>
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
                onSelectCategory={setActiveCategory}
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
                      setActiveCategory(cat);
                      setMobileFilterOpen(false);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Right Main Product Area */}
            <div className="lg:col-span-9">
              {/* Sort Bar */}
              <div className="hidden lg:flex items-center justify-between pb-6 mb-6 border-b border-[#E8DACD]/60">
                <span className="text-xs font-medium text-[#705B54]">
                  Showing 1-8 of 120 products
                </span>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#705B54] font-medium">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="py-1.5 px-3 bg-[#F2E6DA] border border-[#E8DACD] rounded-lg text-xs font-medium text-[#2B1B17] outline-none"
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
                      className={`p-1.5 rounded-md transition-colors ${
                        viewMode === 'grid' ? 'bg-[#7A0C1E] text-white' : 'text-gray-400 hover:text-[#2B1B17]'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-colors ${
                        viewMode === 'list' ? 'bg-[#7A0C1E] text-white' : 'text-gray-400 hover:text-[#2B1B17]'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-2 rounded-lg border border-[#E8DACD] text-[#2B1B17] disabled:opacity-40 hover:bg-[#F2E6DA]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 text-xs font-bold rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-[#7A0C1E] text-white shadow-sm'
                        : 'border border-[#E8DACD] text-[#2B1B17] hover:bg-[#F2E6DA]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-2 rounded-lg border border-[#E8DACD] text-[#2B1B17] hover:bg-[#F2E6DA]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
