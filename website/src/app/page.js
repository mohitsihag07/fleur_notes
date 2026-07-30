import { Hero } from '@/components/home/Hero';
import { ValueProps } from '@/components/home/ValueProps';
import { Categories } from '@/components/home/Categories';
import { ShopByType } from '@/components/home/ShopByType';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { FAQ } from '@/components/home/FAQ';
import { Newsletter } from '@/components/home/Newsletter';
import { EthicalBadges } from '@/components/home/EthicalBadges';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <ShopByType />
      <Categories />
      <FeaturedProducts />
      <FAQ />
      <Newsletter />
      <EthicalBadges />
    </>
  );
}
