import { Hero } from '@/components/home/Hero';
import { ValueProps } from '@/components/home/ValueProps';
import { Categories } from '@/components/home/Categories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { Newsletter } from '@/components/home/Newsletter';
import { EthicalBadges } from '@/components/home/EthicalBadges';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <Categories />
      <FeaturedProducts />
      <Newsletter />
      <EthicalBadges />
    </>
  );
}
