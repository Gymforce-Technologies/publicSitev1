import { z } from "zod";
import { messages } from "@/config/messages";
import { fileSchema } from "./common-rules";

export const productFormSchema = z.object({
  title: z.string().min(1, { message: messages.productNameIsRequired }),
  sku: z.string().optional(),
  type: z
    .string({ required_error: messages.productTypeIsRequired })
    .min(1, { message: messages.productTypeIsRequired }),
  categories: z.string().optional(),
  description: z.string().optional(),
  productImages: z.array(fileSchema).optional(),
  price: z.coerce.number().min(1, { message: messages.priceIsRequired }),
  costPrice: z.coerce.number().optional(),
  retailPrice: z.coerce
    .number()
    .min(1, { message: messages.retailPriceIsRequired }),
  salePrice: z.coerce
    .number()
    .min(1, { message: messages.salePriceIsRequired }),
  inventoryTracking: z.string().optional(),
  currentStock: z.number().or(z.string()).optional(),
  lowStock: z.number().or(z.string()).optional(),
  productAvailability: z.string().optional(),
  tradeNumber: z.number().or(z.string()).optional(),
  manufacturerNumber: z.number().or(z.string()).optional(),
  brand: z.string().optional(),
  upcEan: z.number().or(z.string()).optional(),
  customFields: z
    .array(
      z.object({
        label: z.string().optional(),
        value: z.string().optional(),
      })
    )
    .optional(),

  freeShipping: z.boolean().optional(),
  shippingPrice: z.coerce
    .number()
    .min(1, { message: messages.shippingPriceIsRequired }),
  locationBasedShipping: z.boolean().optional(),
  locationShipping: z
    .array(
      z.object({
        name: z.string().optional(),
        shippingCharge: z.number().or(z.string()).optional(),
      })
    )
    .optional(),
  pageTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  productUrl: z.string().optional(),
  isPurchaseSpecifyDate: z.boolean().optional(),
  isLimitDate: z.boolean().optional(),
  dateFieldName: z.string().optional(),
  availableDate: z.date().min(new Date("1900-01-01")).optional(),
  endDate: z.date().min(new Date("1900-01-02")).optional(),
  productVariants: z
    .array(
      z.object({
        name: z.string().optional(),
        value: z.string().optional(),
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
});

export const newProductchema = z.object({
  title: z.string().min(1, { message: messages.productNameIsRequired }),
  sku: z.string().optional(),
  product_type: z
    .string({ required_error: messages.productTypeIsRequired })
    .min(1, { message: messages.productTypeIsRequired }),
  categories: z.number().or(z.string()).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  //  z.array(fileSchema).optional(),
  // price: z.coerce.number().min(1, { message: messages.priceIsRequired }),
  cost_price: z.string().optional(),
  sell_price: z.string().min(1, { message: messages.retailPriceIsRequired }),
  // salePrice: z.coerce
  //   .number()
  //   .min(1, { message: messages.salePriceIsRequired }),
  is_track: z.boolean().optional(),
  current_stock_level: z.number().or(z.string()).optional(),
  low_stock_level: z.number().or(z.string()).optional(),
  // productAvailability: z.string().optional(),
  // tradeNumber: z.number().or(z.string()).optional(),
  center: z.string().optional(),
  manufacturer: z.number().or(z.string()).optional(),
  brand_name: z.string().optional(),
  product_ean: z.number().or(z.string()).optional(),
});

export type NewProduct = z.infer<typeof newProductchema>;

export type CreateProductInput = z.infer<typeof productFormSchema>;
