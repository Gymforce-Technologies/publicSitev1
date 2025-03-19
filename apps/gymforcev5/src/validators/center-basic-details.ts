import { z } from "zod";
import {
  fileSchema,
  validateEmail,
  validateEmailOld,
} from "@/validators/common-rules";
import { time } from "console";

// form zod validation schema
export const basicDetailsFormSchema = z.object({
  name: z.string().min(1, { message: "Gym name required" }),
  business_name: z.string().min(1, { message: "Business name required" }),
  contact_no: z.number().min(1000000000, { message: "Enter a valid number" }), // Ensuring at least 10 digits
  alt_contact_no: z.number().optional(),
  street: z.string().min(1, { message: "Street required" }),
  city: z.string().min(1, { message: "City required" }),
  zip_code: z.string().min(1, { message: "Zip code required" }),
  state: z.string().min(1, { message: "State required" }),
  country: z.string().min(1, { message: "Country required" }),
  email: validateEmailOld,
  gym_logo: fileSchema.optional(),
  currency: z.string().min(1, { message: "Currency required" }),
  address: z.string().optional(),
  contact_number_length: z.number().min(1, { message: "Enter a valid number" }),

});

// Generate form types from Zod validation schema
export type basicdetailFormTypes = z.infer<typeof basicDetailsFormSchema>;

export const defaultValues = {
  name: "",
  email: "",
  // gym_image: '',
  currency: "",
  contact_no: 0,
  street: "",
  city: "",
  zip_code: "",
  state: "",
  country: "",
  alt_contact_no: 0,
  business_name: "",
  contact_number_length: 0,
};
