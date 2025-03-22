"use client";

import {
  useForm,
  useWatch,
  FormProvider,
  type SubmitHandler,
} from "react-hook-form";
import { useState } from "react";
import { useSetAtom } from "jotai";
import toast from "react-hot-toast";
import isEmpty from "lodash/isEmpty";
import { zodResolver } from "@hookform/resolvers/zod";
import DifferentBillingAddress from "@/app/shared/ecommerce/order/order-form/different-billing-address";
import { defaultValues } from "@/app/shared/ecommerce/order/order-form/form-utils";
import CustomerInfo from "@/app/shared/ecommerce/order/order-form/customer-info";
import AddressInfo from "@/app/shared/ecommerce/order/order-form/address-info";
import { Text } from "rizzui";
import cn from "@core/utils/class-names";
import OrderSummery from "@/app/shared/ecommerce/checkout/order-summery";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { DUMMY_ID } from "@/config/constants";
import OrderNote from "@/app/shared/ecommerce/checkout/order-note";
// import {
//   billingAddressAtom,
//   orderNoteAtom,
//   shippingAddressAtom,
// } from '@/store/checkout';
import {
  CreateOrderInput,
  orderFormSchema,
} from "@/validators/create-order.schema";
import { fileSchema } from "@/validators/common-rules";

// main order form component for create and update order
export default function CreateOrder({
  id,
  order,
  className,
}: {
  id?: string;
  className?: string;
  order?: CreateOrderInput;
}) {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  // const setOrderNote = useSetAtom(orderNoteAtom);
  // const setBillingAddress = useSetAtom(billingAddressAtom);
  // const setShippingAddress = useSetAtom(shippingAddressAtom);

  return <div>Build Fix</div>;
}
