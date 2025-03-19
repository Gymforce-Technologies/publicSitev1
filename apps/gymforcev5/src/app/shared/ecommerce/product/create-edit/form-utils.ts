import {
  CreateProductInput,
  NewProduct,
} from "@/validators/create-product.schema";
import isEmpty from "lodash/isEmpty";

export const customFields = [
  {
    label: "",
    value: "",
  },
];
export const locationShipping = [
  {
    name: "",
    shippingCharge: "",
  },
];
export const productVariants = [
  {
    label: "",
    value: "",
  },
];

// export function defaultValues(product?: NewProduct) {
//   return {
//     title: product?.title ?? "",
//     sku: product?.sku ?? "",
//     type: product?.type ?? "",
//     categories: product?.categories ?? "",
//     description: product?.description ?? "",
//     price: product?.price ?? undefined,
//     costPrice: product?.costPrice ?? undefined,
//     retailPrice: product?.retailPrice ?? undefined,
//     salePrice: product?.salePrice ?? undefined,
//     inventoryTracking: product?.inventoryTracking ?? "",
//     currentStock: product?.currentStock ?? "",
//     lowStock: product?.lowStock ?? "",
//     productAvailability: product?.productAvailability ?? "",
//     productImages: product?.productImages ?? undefined,
//     tradeNumber: product?.tradeNumber ?? "",
//     manufacturerNumber: product?.manufacturerNumber ?? "",
//     brand: product?.brand ?? "",
//     upcEan: product?.upcEan ?? "",
//     customFields: isEmpty(product?.customFields)
//       ? customFields
//       : product?.customFields,

//     freeShipping: product?.freeShipping ?? false,
//     shippingPrice: product?.shippingPrice ?? undefined,
//     locationBasedShipping: product?.locationBasedShipping ?? false,
//     locationShipping: isEmpty(product?.locationShipping)
//       ? locationShipping
//       : product?.locationShipping,
//     pageTitle: product?.pageTitle ?? "",
//     metaDescription: product?.metaDescription ?? "",
//     metaKeywords: product?.metaKeywords ?? "",
//     productUrl: product?.productUrl ?? "",
//     isPurchaseSpecifyDate: product?.isPurchaseSpecifyDate ?? false,
//     isLimitDate: product?.isLimitDate ?? false,
//     dateFieldName: product?.dateFieldName ?? "",
//     productVariants: isEmpty(product?.productVariants)
//       ? productVariants
//       : product?.productVariants,
//     tags: product?.tags ?? [],
//   };
// }

// export const productData = {
//   title: "Apple",
//   description: "Fresh Express Iceberg Garden Salad Blend",
//   sku: "SKU-28935",
//   type: "Digital Product",
//   categories: "Grocery",
//   price: 10,
//   costPrice: 20,
//   retailPrice: 15,
//   salePrice: 25,
//   productImages: undefined,
//   inventoryTracking: "no",
//   currentStock: "150",
//   lowStock: "20",
//   productAvailability: "online",
//   tradeNumber: "12345",
//   manufacturerNumber: "154",
//   brand: "Foska",
//   upcEan: "Ean",
//   customFields: [
//     {
//       label: "Color",
//       value: "Red",
//     },
//   ],
//   freeShipping: false,
//   shippingPrice: 45,
//   locationBasedShipping: true,
//   locationShipping: [
//     {
//       name: "USA",
//       shippingCharge: "150",
//     },
//   ],
//   pageTitle: "apple",
//   metaDescription: "apple",
//   metaKeywords: "grocery, foods",
//   productUrl: "http://localhost:3000/",
//   isPurchaseSpecifyDate: true,
//   isLimitDate: true,
//   dateFieldName: "Date Field",
//   productVariants: [
//     {
//       name: "Jhon",
//       value: "150",
//     },
//   ],
//   tags: ["iPhone", "mobile"],
// };
export function defaultValues(product?: NewProduct) {
  return {
    title: product?.title ?? "",
    sku: product?.sku ?? "",
    product_type: product?.product_type ?? "",
    categories: product?.categories ?? "",
    description: product?.description ?? "",
    image: product?.image ?? "",
    // price: product?.price ?? undefined,
    cost_price: product?.cost_price ?? "",
    sell_price: product?.sell_price ?? "",
    is_track: product?.is_track ?? false,
    current_stock_level: product?.current_stock_level ?? "",
    low_stock_level: product?.low_stock_level ?? "",
    // center: product?.center ?? "",
    manufacturer: product?.manufacturer ?? "",
    brand_name: product?.brand_name ?? "",
    product_ean: product?.product_ean ?? "",
  };
}

export const productData: NewProduct = {
  title: "Apple",
  sku: "SKU-28935",
  product_type: "Digital Product",
  categories: 1,
  description: "Fresh Express Iceberg Garden Salad Blend",
  image: undefined,
  // price: 10,
  cost_price: "20",
  sell_price: "15",
  is_track: false,
  current_stock_level: 150,
  low_stock_level: 20,
  center: "online",
  manufacturer: "154",
  brand_name: "Foska",
  product_ean: "Ean",
};

export const menuItems = [
  {
    label: "Summary",
    value: "summary",
  },
  {
    label: "Images & Gallery",
    value: "images_gallery",
  },
  {
    label: "Pricing & Inventory",
    value: "pricing_inventory",
  },
  {
    label: "Product Identifiers",
    value: "product_identifiers",
  },
  // {
  //   label: "Shipping & Availability",
  //   value: "shipping_availability",
  // },
  // {
  //   label: "SEO",
  //   value: "seo",
  // },
  // {
  //   label: "Variant Options",
  //   value: "variant_options",
  // },
];

// Category option
export const categoryOption = [
  {
    value: "1",
    label: "Supplements",
  },
  {
    value: "2",
    label: "Workout Equipment",
  },
  {
    value: "3",
    label: "Apparel",
  },
  {
    value: "4",
    label: "Accessories",
  },
  {
    value: "5",
    label: "Footwear",
  },
  {
    value: "6",
    label: "Nutrition & Snacks",
  },
  {
    value: "7",
    label: "Hydration",
  },
  {
    value: "8",
    label: "Recovery Tools",
  },
];

// Type option
export const typeOption = [
  {
    value: "Pos",
    label: "Product",
  },
  {
    value: "Equip",
    label: "Equipment",
  },
];

// Variant option
export const variantOption = [
  {
    value: "single",
    label: "Single",
  },
  {
    value: "multiple",
    label: "Multiple",
  },
];
