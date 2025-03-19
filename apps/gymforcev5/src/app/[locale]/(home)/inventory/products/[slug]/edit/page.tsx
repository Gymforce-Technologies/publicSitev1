"use client";
import Link from "next/link";
// import { Metadata } from 'next';
import { PiPlusBold } from "react-icons/pi";
import { productData } from "@/app/shared/ecommerce/product/create-edit/form-utils";
import CreateEditProduct from "@/app/shared/ecommerce/product/create-edit";
import PageHeader from "@/app/shared/page-header";
// import { metaObject } from '@/config/site.config';
// import { Button } from "rizzui";
// import { routes } from "@/config/routes";
import { useEffect, useState } from "react";
import { retrieveGymId } from "@/app/[locale]/auth/InfoCookies";
import { AxiosPrivate } from "@/app/[locale]/auth/AxiosPrivate";
import Loader from "@/app/[locale]/(home)/loading";

type Props = {
  params: { slug: string };
};

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   // read route params
//   const slug = params.slug;

//   return metaObject(`Edit ${slug}`);
// }

const pageHeader = {
  title: "Edit Product",
  breadcrumb: [
    // {
    //   href: routes.eCommerce.dashboard,
    //   name: 'E-Commerce',
    // },
    // {
    //   href: routes.eCommerce.products,
    //   name: 'Products',
    // },
    // {
    //   name: 'Edit',
    // },
  ],
};

export default function EditProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const [data, setData] = useState(productData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const gymId = await retrieveGymId();
        const response = await AxiosPrivate.get(
          `/api/products/?center=${gymId}`,
          {
            id: `product-list`,
          }
        );
        const dataVal = response.data?.find(
          (product: any) => product.id === parseInt(params.slug)
        );
        // const newData = {
        //   ...dataVal,
        //   categories: dataVal.categories.toString(),
        // };
        setData(dataVal);
        console.log("product_data", dataVal);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) {
      getProducts();
    }
  }, [params.slug]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      {loading && params.slug ? (
        <Loader />
      ) : (
        <CreateEditProduct slug={params.slug} product={data} />
      )}
    </>
  );
}
