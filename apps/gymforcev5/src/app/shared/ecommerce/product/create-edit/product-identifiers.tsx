import { useFormContext } from "react-hook-form";
import { Input } from "rizzui";
import cn from "@core/utils/class-names";
import FormGroup from "@/app/shared/form-group";
import CustomFields from "@/app/shared/ecommerce/product/create-edit/custom-fields";

interface ProductIdentifiersProps {
  className?: string;
}

export default function ProductIdentifiers({
  className,
}: ProductIdentifiersProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <FormGroup
      title="Product Identifiers"
      description="Edit your product identifiers here"
      className={cn(className)}
    >
      <Input
        label="Brand Name"
        placeholder="brand name"
        {...register("brand_name")}
        error={errors.brand_name?.message as string}
      />
      {/* <Input
        label="Global Trade Item Number"
        placeholder="12345"
        {...register("tradeNumber")}
        error={errors.tradeNumber?.message as string}
      /> */}
      <Input
        label="Manufacturer"
        placeholder="145782"
        {...register("manufacturer")}
        error={errors.manufacturer?.message as string}
      />

      <Input
        label="Product UPC/EAN "
        placeholder="145782"
        {...register("product_ean")}
        error={errors.product_ean?.message as string}
      />
      {/* <CustomFields /> */}
    </FormGroup>
  );
}
