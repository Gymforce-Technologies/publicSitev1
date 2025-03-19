import Link from "next/link";
import { PiPlusBold } from "react-icons/pi";
import CreateEditProduct from "@/app/shared/ecommerce/product/create-edit";
import { metaObject } from "@/config/site.config";
import PageHeader from "@/app/shared/page-header";
import { Button } from "rizzui";
import { routes } from "@/config/routes";

// export const metadata = {
//   ...metaObject('Create Product'),
// };

const pageHeader = {
  title: "Create Product",
  breadcrumb: [
    // {
    //   href: routes.eCommerce.dashboard,
    //   name: "E-Commerce",
    // },
    // {
    //   href: routes.eCommerce.products,
    //   name: "Products",
    // },
    // {
    //   name: "Create",
    // },
  ],
};

export default function CreateProductPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <CreateEditProduct />
    </>
  );
}
