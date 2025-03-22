import Link from "next/link";
import { routes } from "@/config/routes";
import { Button, Title } from "rizzui";
import ProductModernCard from "@core/components/cards/product-modern-card";
// import { similarProducts } from '@/data/similar-products-data';

export default function ProductDetailsRelatedProducts() {
  return (
    <section className="pt-10 @5xl:pt-12 @7xl:pt-14">
      <header className="mb-4 flex items-center justify-between">
        <Title as="h3" className="font-semibold">
          Similar Products
        </Title>
        <Link href={routes.eCommerce.shop}>
          <Button as="span" variant="text" className="py-0 underline">
            See All
          </Button>
        </Link>
      </header>
    </section>
  );
}
