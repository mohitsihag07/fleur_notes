import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF5EF] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#F2E6DA] border border-[#E8DACD] flex items-center justify-center animate-spin">
          <Sparkles className="w-6 h-6 text-[#7A0C1E]" />
        </div>
        <p className="font-serif-luxury text-sm text-[#7A0C1E] tracking-wider font-semibold">Fleur Notes</p>
      </div>
    </div>
  );
}
