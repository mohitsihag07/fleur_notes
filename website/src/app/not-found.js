import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-[#FAF5EF] flex items-center justify-center py-20">
      <Container>
        <div className="max-w-md mx-auto text-center space-y-4">
          <span className="font-serif-luxury text-7xl font-bold text-[#7A0C1E]">404</span>
          <h1 className="font-serif-luxury text-3xl font-bold text-[#2B1B17]">Page Not Found</h1>
          <p className="text-xs text-[#705B54]">
            The page you are looking for might have been removed or is temporarily unavailable.
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button variant="primary" className="rounded-xl px-6 py-2.5 bg-[#7A0C1E] hover:bg-[#5F0917]">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
