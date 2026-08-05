'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { productService } from '@/services/productService';
import { getFormattedImage } from '@/utils/formatImage';

export function SearchBar({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await productService.getProducts({
          search: query.trim(),
          limit: 6,
          status: 'active'
        });
        const items = response?.data || [];
        const formatted = items.map((p, idx) => {
          let rawImg = null;
          if (p.images && p.images.length > 0) {
            const thumb = p.images.find((img) => img.is_thumbnail) || p.images[0];
            rawImg = thumb?.image;
          } else if (p.image) {
            rawImg = p.image;
          }
          return {
            id: p.id || p._id || `search-${idx}`,
            name: p.name,
            slug: p.slug || p.id || p._id,
            price: p.sale_price ? parseFloat(p.sale_price) : parseFloat(p.price || 0),
            image: getFormattedImage(rawImg),
            category: p.category?.name || ''
          };
        });
        setResults(formatted);
      } catch (err) {
        console.error('Failed to search products:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectTerm = (term) => {
    setQuery(term);
    onClose();
    router.push(`/shop?search=${encodeURIComponent(term)}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-5 sm:p-6 border border-[#E8DACD] overflow-hidden"
        >
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 border-b border-[#E8DACD] pb-4">
            <Search className="w-5 h-5 text-[#7A0C1E] shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, candles, hampers..."
              className="w-full text-base sm:text-lg outline-none text-[#2B1B17] placeholder-gray-400 bg-transparent font-sans"
            />
            {loading && <Loader2 className="w-4 h-4 text-[#7A0C1E] animate-spin shrink-0" />}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </form>

          {/* Live Search Results */}
          {query.trim().length > 0 ? (
            <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                <span>Search Results ({results.length})</span>
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="text-[#7A0C1E] hover:underline flex items-center gap-1 font-bold text-xs normal-case cursor-pointer"
                >
                  <span>View all in shop</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#FAF5EF] border border-transparent hover:border-[#E8DACD] transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative border border-[#E8DACD]/60">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#2B1B17] truncate group-hover:text-[#7A0C1E] transition-colors">
                          {product.name}
                        </h4>
                        {product.category && (
                          <p className="text-[10px] text-gray-400 truncate">{product.category}</p>
                        )}
                        <p className="text-xs font-bold text-[#7A0C1E] mt-0.5">₹{product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : !loading ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  No products found for &quot;{query}&quot;
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Popular Searches
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Ceramic Vase', 'Soy Candle', 'Macrame', 'Gift Box', 'Botanical Salt'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectTerm(term)}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#F2E6DA] text-[#7A0C1E] hover:bg-[#7A0C1E] hover:text-white transition-colors cursor-pointer font-medium"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
