"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Element } from "react-scroll";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";
import FormNav, {
  formParts,
} from "@/app/shared/ecommerce/product/create-edit/form-nav";
import ProductSummary from "@/app/shared/ecommerce/product/create-edit/product-summary";
import { defaultValues } from "@/app/shared/ecommerce/product/create-edit/form-utils";
import ProductMedia from "@/app/shared/ecommerce/product/create-edit/product-media";
import PricingInventory from "@/app/shared/ecommerce/product/create-edit/pricing-inventory";
import ProductIdentifiers from "@/app/shared/ecommerce/product/create-edit/product-identifiers";
// import ShippingInfo from "@/app/shared/ecommerce/product/create-edit/shipping-info";
// import ProductSeo from "@/app/shared/ecommerce/product/create-edit/product-seo";
// import DeliveryEvent from "@/app/shared/ecommerce/product/create-edit/delivery-event";
// import ProductVariants from "@/app/shared/ecommerce/product/create-edit/product-variants";
// import ProductTaxonomies from "@/app/shared/ecommerce/product/create-edit/product-tags";
import FormFooter from "@core/components/form-footer";
import {
  NewProduct,
  newProductchema,
  productFormSchema,
} from "@/validators/create-product.schema";
import { useLayout } from "@/layouts/use-layout";
import { LAYOUT_OPTIONS } from "@/config/enums";
import { AxiosPrivate, invalidateAll } from "@/app/[locale]/auth/AxiosPrivate";

const MAP_STEP_TO_COMPONENT = {
  [formParts.summary]: ProductSummary,
  [formParts.media]: ProductMedia,
  [formParts.pricingInventory]: PricingInventory,
  [formParts.productIdentifiers]: ProductIdentifiers,
  // [formParts.shipping]: ShippingInfo,
  // [formParts.seo]: ProductSeo,
  // [formParts.deliveryEvent]: DeliveryEvent,
  // [formParts.variantOptions]: ProductVariants,
  // [formParts.tagsAndCategory]: ProductTaxonomies,
};

interface IndexProps {
  slug?: string;
  className?: string;
  product?: NewProduct;
}

export default function CreateEditProduct({
  slug,
  product,
  className,
}: IndexProps) {
  const { layout } = useLayout();
  const [isLoading, setLoading] = useState(false);
  const methods = useForm<NewProduct>({
    resolver: zodResolver(newProductchema),
    defaultValues: defaultValues(product),
  });

  const onSubmit: SubmitHandler<NewProduct> = async (data) => {
    setLoading(true);
    console.log("product_data", data);
    if (slug) {
      try {
        const gymId = 1;
        const resp = await AxiosPrivate.put(
          `/api/products/${slug}/update/?gym_id=${gymId}`,
          {
            ...data,
            center: gymId,
          }
        );
      } catch (error) {
        console.log(error);
        toast.error("Error in Product Updation");
      }
    } else {
      try {
        const gymId = 1;
        const resp = await AxiosPrivate.post(
          `/api/products/create/?gym_id=${gymId}`,
          { ...data, center: gymId }
        );
        console.log(resp.data);
        invalidateAll();
      } catch (error) {
        console.log(error);
        toast.error("Error in Product Creation");
      }
    }
    setLoading(false);
    toast.success(
      <Text as="b">Product successfully {slug ? "updated" : "created"}</Text>
    );
    // methods.reset();
  };

  useEffect(() => {
    console.log("Form values:", methods.watch());
    console.log("Form errors:", methods.formState.errors);
  }, [methods.watch(), methods.formState]);

  return (
    <div className="@container">
      <FormNav
        className={cn(
          layout === LAYOUT_OPTIONS.BERYLLIUM && "z-[999] 2xl:top-[72px]"
        )}
      />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className={cn(
            "relative z-[19] [&_label.block>span]:font-medium",
            className
          )}
        >
          <div className="mb-10 p-2 md:p-4 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            {Object.entries(MAP_STEP_TO_COMPONENT).map(([key, Component]) => (
              <Element
                key={key}
                name={formParts[key as keyof typeof formParts]}
              >
                {<Component className="pt-7 @2xl:pt-9 @3xl:pt-11" />}
              </Element>
            ))}
          </div>

          <FormFooter
            isLoading={isLoading}
            altBtnText="Cancel"
            submitBtnText={slug ? "Update Product" : "Create Product"}
          />
        </form>
      </FormProvider>
    </div>
  );
}
