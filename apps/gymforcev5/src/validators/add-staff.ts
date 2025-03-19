import { z } from "zod";

export const AddStaffFormSchema = z.object({
  name: z.string().min(1, { message: "Staff Name is required" }),
  contact: z.string().min(1, { message: "Enter a valid number" }),
  staffTypeId: z.string().min(1, { message: "Staff Type is required" }),

  address_street: z.string().optional(),
  employment_type: z.string().optional().nullable(),
  shift_id: z.number().optional().nullable(),
  specializations: z.string().optional(),
  qualifications: z.string().optional(),
  base_salary: z.string().optional(),
  trainerCommissionPercentage: z.string().optional(),
  annual_paid_leaves_alloted: z.string().optional(),
  monthly_leaves_limit: z.string().optional(),

  gender: z.string().optional(),
  emergency_contact_number: z.string().optional(),
  date_of_birth: z.date().optional().nullable(),
  address_country: z.string().optional(),
  address_zip_code: z.string().optional(),
  staff_image: z.instanceof(File).optional(),
  marital_status: z.string().optional().nullable(),
  certifications: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
});

export type AddStaffFormTypes = z.infer<typeof AddStaffFormSchema>;

export const defaultValues = {
  name: "",
  contact: "",
  staffTypeId: "",
  address_street: "",
  employment_type: "",
  shift_id: undefined as unknown as number,
  qualifications: "",
  specializations: "",
  base_salary: "",
  trainerCommissionPercentage: "",
  annual_paid_leaves_alloted: "",
  monthly_leaves_limit: "",

  gender: "",
  date_of_birth: undefined,
  address_country: "",
  address_zip_code: "",
  staff_image: undefined,
  marital_status: "",
  certifications: "",
  emergency_contact_relation: "",
  emergency_contact_number: "",
};
