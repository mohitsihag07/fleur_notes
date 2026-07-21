'use client';

import React, { useState } from 'react';
import { categories } from '@/data/categories';

export function FilterSidebar({ activeCategory, onSelectCategory }) {
  const [priceRange, setPriceRange] = useState(150);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const colors = [
    { name: 'White', colorClass: 'bg-white border-gray-300' },
    { name: 'Cream', colorClass: 'bg-[#F2E6DA] border-gray-300' },
    { name: 'Beige', colorClass: 'bg-[#F5E6D3] border-gray-300' },
    { name: 'Crimson', colorClass: 'bg-[#7A0C1E]' },
    { name: 'Bronze', colorClass: 'bg-[#A87B39]' },
    { name: 'Mocha', colorClass: 'bg-[#4A2E1B]' }
  ];

  const materials = [
    { name: 'Ceramic', count: 18 },
    { name: 'Wood', count: 20 },
    { name: 'Glass', count: 14 },
    { name: 'Cotton', count: 16 },
    { name: 'Metal', count: 10 }
  ];

  const toggleMaterial = (mat) => {
    if (selectedMaterials.includes(mat)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m !== mat));
    } else {
      setSelectedMaterials([...selectedMaterials, mat]);
    }
  };

  return (
    <div className="space-y-8 bg-white p-6 rounded-2xl border border-[#E8DACD]/70 shadow-sm">
      {/* Categories List */}
      <div>
        <h3 className="font-semibold text-sm text-[#2B1B17] uppercase tracking-wider mb-4">
          Categories
        </h3>
        <ul className="space-y-1 text-xs">
          <li>
            <button
              onClick={() => onSelectCategory('all')}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-left transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#F2E6DA] text-[#7A0C1E] font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>All Products</span>
              <span className="text-gray-400 font-normal">(120)</span>
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onSelectCategory(cat.slug)}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-left transition-colors ${
                  activeCategory === cat.slug
                    ? 'bg-[#F2E6DA] text-[#7A0C1E] font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-gray-400 font-normal">({cat.itemCount})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-[#E8DACD]" />

      {/* Filter By Section */}
      <div>
        <h3 className="font-semibold text-sm text-[#2B1B17] uppercase tracking-wider mb-4">
          Filter By
        </h3>

        {/* Price Slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-medium text-[#2B1B17] mb-2">
            <span>Price</span>
            <span className="text-[#7A0C1E]">$0 – ${priceRange}</span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full accent-[#7A0C1E] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>$0</span>
            <span>$150</span>
          </div>
        </div>

        {/* Color Swatches */}
        <div className="mb-6">
          <span className="block text-xs font-medium text-[#2B1B17] mb-2">Color</span>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(selectedColor === c.name ? null : c.name)}
                className={`w-6 h-6 rounded-full border ${c.colorClass} transition-transform ${
                  selectedColor === c.name ? 'scale-125 ring-2 ring-[#7A0C1E] ring-offset-1' : ''
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Material Checkboxes */}
        <div>
          <span className="block text-xs font-medium text-[#2B1B17] mb-2">Material</span>
          <div className="space-y-2">
            {materials.map((m) => (
              <label key={m.name} className="flex items-center justify-between text-xs text-gray-600 cursor-pointer hover:text-[#2B1B17]">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedMaterials.includes(m.name)}
                    onChange={() => toggleMaterial(m.name)}
                    className="rounded text-[#7A0C1E] focus:ring-[#7A0C1E] accent-[#7A0C1E]"
                  />
                  <span>{m.name}</span>
                </div>
                <span className="text-gray-400">({m.count})</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
