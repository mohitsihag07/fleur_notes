'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { categoryService } from '@/services/categoryService';


const PRICE_MIN = 0;
const PRICE_MAX = 10000;

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E8DACD]/60 pb-4 last:border-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 text-left cursor-pointer"
      >
        <span className="font-semibold text-xs text-[#2B1B17] uppercase tracking-wider">{title}</span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        }
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function PriceRangeSlider({ min, max, onChange }) {
  const pct = (v) => ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const handleMin = (e) => {
    const val = Math.min(Number(e.target.value), max - 100);
    onChange(val, max);
  };
  const handleMax = (e) => {
    const val = Math.max(Number(e.target.value), min + 100);
    onChange(min, val);
  };

  return (
    <div className="px-1 pt-1 pb-2">
      {/* Price labels */}
      <div className="flex justify-between text-xs font-bold text-[#7A0C1E] mb-4">
        <span>₹{min.toLocaleString('en-IN')}</span>
        <span>₹{max.toLocaleString('en-IN')}</span>
      </div>

      {/* Slider track */}
      <div className="relative h-1.5 rounded-full bg-[#E8DACD] mb-5">
        {/* Filled range */}
        <div
          className="absolute h-1.5 rounded-full bg-[#7A0C1E]"
          style={{
            left: `${pct(min)}%`,
            right: `${100 - pct(max)}%`,
          }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={100}
          value={min}
          onChange={handleMin}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer price-thumb"
          style={{ top: 0, left: 0 }}
        />

        {/* Max thumb */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={100}
          value={max}
          onChange={handleMax}
          className="absolute w-full h-1.5 appearance-none bg-transparent cursor-pointer price-thumb"
          style={{ top: 0, left: 0 }}
        />
      </div>

      <style jsx>{`
        .price-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #7A0C1E;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer;
          transition: transform 0.15s;
        }
        .price-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        .price-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #7A0C1E;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export function FilterSidebar({
  activeCategory,
  onSelectCategory,
  filters,
  onFiltersChange,
  products = [],
}) {
  const [categoriesList, setCategoriesList] = useState([]);

  // Derive unique colors from live products
  const uniqueColors = Array.from(
    new Set(
      products
        .map(p => (p.color || '').trim())
        .filter(c => c.length > 0)
    )
  ).sort();

  useEffect(() => {
    async function loadCategories() {
      try {
        const fetched = await categoryService.getCategories({ status: 'active' });
        if (Array.isArray(fetched) && fetched.length > 0) {
          setCategoriesList(fetched);
        }
      } catch (err) {
        console.error('Failed to load categories for sidebar:', err);
        setCategoriesList([]);
      }
    }
    loadCategories();
  }, []);

  const typeOptions = [
    { id: 'all',          name: 'All Products',  slug: 'all'          },
    { id: 'featured',     name: 'Featured',      slug: 'featured'     },
    { id: 'bestsellers',  name: 'Bestsellers',   slug: 'bestsellers'  },
    { id: 'new-arrivals', name: 'New Arrivals',  slug: 'new-arrivals' },
  ];

  const toggleColor = (colorName) => {
    const current = filters.colors || [];
    const next = current.includes(colorName)
      ? current.filter(c => c !== colorName)
      : [...current, colorName];
    onFiltersChange({ ...filters, colors: next });
  };

  const handlePriceChange = (min, max) => {
    onFiltersChange({ ...filters, priceRange: { min, max } });
  };

  const toggleRating = (star) => {
    onFiltersChange({ ...filters, minRating: filters.minRating === star ? 0 : star });
  };

  const hasActiveFilters =
    (filters.colors && filters.colors.length > 0) ||
    (filters.priceRange && (filters.priceRange.min > PRICE_MIN || filters.priceRange.max < PRICE_MAX)) ||
    filters.minRating > 0;

  const clearAll = () => {
    onFiltersChange({ colors: [], priceRange: null, minRating: 0 });
    onSelectCategory('all');
  };

  return (
    <div className="space-y-0 bg-white p-5 rounded-2xl border border-[#E8DACD]/70 shadow-sm divide-y divide-[#E8DACD]/60">

      {/* Header row: Filters title + Clear All button */}
      <div className="flex items-center justify-between pb-3">
        <span className="font-black text-sm text-[#2B1B17] tracking-tight">Filters</span>
        <button
          onClick={clearAll}
          disabled={!hasActiveFilters}
          className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
            hasActiveFilters
              ? 'text-[#7A0C1E] border-[#7A0C1E] bg-[#FAF5EF] hover:bg-[#7A0C1E] hover:text-white'
              : 'text-gray-300 border-gray-200 bg-gray-50 cursor-not-allowed'
          }`}
        >
          Clear All
        </button>
      </div>

      {/* ── Categories & Types ── */}
      <Section title="Categories & Types">
        <ul className="space-y-1 text-xs">
          {typeOptions.map((type) => (
            <li key={type.id}>
              <button
                onClick={() => onSelectCategory(type.slug)}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-left transition-all cursor-pointer ${
                  activeCategory === type.slug
                    ? 'bg-[#7A0C1E] text-white font-bold shadow-xs'
                    : 'text-[#2B1B17] font-medium hover:bg-[#FAF5EF] hover:text-[#7A0C1E]'
                }`}
              >
                <span>{type.name}</span>
              </button>
            </li>
          ))}

          {categoriesList.length > 0 && (
            <li className="pt-3 pb-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-2">
                Shop By Category
              </span>
            </li>
          )}

          {categoriesList.map((cat) => {
            const catSlug = cat.slug || cat._id || cat.id;
            const isSelected = activeCategory === catSlug || activeCategory === cat.name?.toLowerCase().trim();
            return (
              <li key={cat.id || cat._id || catSlug}>
                <button
                  onClick={() => onSelectCategory(catSlug)}
                  className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#7A0C1E] text-white font-bold shadow-xs'
                      : 'text-[#2B1B17] font-medium hover:bg-[#FAF5EF] hover:text-[#7A0C1E]'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.itemCount !== undefined && (
                    <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      ({cat.itemCount})
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* ── Price Range ── */}
      <Section title="Price Range">
        <PriceRangeSlider
          min={filters.priceRange?.min ?? PRICE_MIN}
          max={filters.priceRange?.max ?? PRICE_MAX}
          onChange={handlePriceChange}
        />
      </Section>

      {/* ── Rating ── */}
      <Section title="Customer Rating">
        <ul className="space-y-1.5">
          {[4, 3, 2, 1].map((star) => {
            const isSelected = filters.minRating === star;
            return (
              <li key={star}>
                <button
                  onClick={() => toggleRating(star)}
                  className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
                    isSelected ? 'text-[#7A0C1E]' : 'text-[#2B1B17] hover:text-[#7A0C1E]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'bg-[#7A0C1E] border-[#7A0C1E]' : 'border-[#C4A98A]'
                  }`}>
                    {isSelected && (
                      <svg className="w-2 h-2 text-white" viewBox="0 0 10 10" fill="currentColor">
                        <path d="M1 5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < star ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
                      />
                    ))}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">& up</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      {/* ── Color ── */}
      {uniqueColors.length > 0 && (
        <Section title="Color" defaultOpen={false}>
          <ul className="space-y-1.5 text-xs">
            {uniqueColors.map((colorName) => {
              const isSelected = (filters.colors || []).includes(colorName);
              return (
                <li key={colorName}>
                  <button
                    onClick={() => toggleColor(colorName)}
                    className={`w-full flex items-center gap-2.5 py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
                      isSelected ? 'text-[#7A0C1E] font-bold' : 'text-[#2B1B17] font-medium hover:text-[#7A0C1E]'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected ? 'bg-[#7A0C1E] border-[#7A0C1E]' : 'border-[#C4A98A]'
                    }`}>
                      {isSelected && (
                        <svg className="w-2 h-2 text-white" viewBox="0 0 10 10" fill="currentColor">
                          <path d="M1 5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="capitalize">{colorName}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

    </div>
  );
}
