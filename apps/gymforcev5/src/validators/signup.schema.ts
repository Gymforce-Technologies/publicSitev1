import { z } from "zod";
import { messages } from "@/config/messages";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "./common-rules";

// form zod validation schema
export const signUpSchema = (t: (arg: string) => string) =>
  z.object({
    firstName: z.string().min(1, { message: messages.firstNameRequired }),
    lastName: z.string().optional(),
    email: validateEmail(t),
    password: z.string().min(1, { message: messages.passwordRequired }), //validatePassword
    phone: z.string().min(1, { message: messages.phoneNumberIsRequired }),
    address_country: z.string({ message: messages.countryIsRequired }),
    confirmPassword: z
      .string()
      .min(1, { message: messages.confirmPasswordRequired }),
    // confirmPassword: validateConfirmPassword(t),
    isAgreed: z.boolean(),
    center: z.string().min(1, { message: "Please Choose Center Type" }),
    referral_code: z.string().optional(),
  });

// generate form types from zod validation schema
export type SignUpSchema = z.infer<ReturnType<typeof signUpSchema>>;
