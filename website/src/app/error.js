'use client';

import React from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/common/Button';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-[70vh] bg-[#FAF5EF] flex items-center justify-center py-20">
      <Container>
        <div className="max-w-md mx-auto text-center space-y-4">
          <h1 className="font-serif-luxury text-3xl font-bold text-[#7A0C1E]">Something went wrong</h1>
          <p className="text-xs text-[#705B54]">
            {error?.message || 'An unexpected error occurred while loading this page.'}
          </p>
          <div className="pt-4">
            <Button variant="primary" onClick={() => reset()} className="rounded-xl px-6 py-2.5 bg-[#7A0C1E] hover:bg-[#5F0917]">
              Try Again
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
