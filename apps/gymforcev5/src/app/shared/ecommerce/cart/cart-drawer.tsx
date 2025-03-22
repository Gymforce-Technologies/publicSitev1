"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
// import { useCart } from "@/store/quick-cart/cart.context";
import FloatingCartButton from "@/app/shared/floating-cart-button";
import CartDrawerView from "@/app/shared/ecommerce/cart/cart-drawer-view";
import { useParams, usePathname } from "next/navigation";
import { routes } from "@/config/routes";

const Drawer = dynamic(() => import("rizzui").then((module) => module.Drawer), {
  ssr: false,
});

export default function CartDrawer() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const pathname = usePathname();
  const params = useParams();

  // list of included pages
  const includedPaths: string[] = [
    routes.eCommerce.shop,
    routes.eCommerce.productDetails(params?.slug as string),
  ];

  const isPathIncluded = includedPaths.some((path) => pathname === path);
  return (
    <>
      <div>Hi</div>
    </>
  );
}
