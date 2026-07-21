'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

export function SearchBar({ isOpen, onClose }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 mx-4 border border-[#E8DACD]"
        >
          <div className="flex items-center gap-3 border-b border-[#E8DACD] pb-4">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for ceramic vases, soy candles, gift hampers..."
              className="w-full text-lg outline-none text-[#2B1B17] placeholder-gray-400 bg-transparent font-sans"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Popular Searches
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Ceramic Vase', 'Soy Candle', 'Macrame', 'Gift Box', 'Botanical Salt'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#F2E6DA] text-[#7A0C1E] hover:bg-[#7A0C1E] hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
