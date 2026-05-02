import { z } from "zod";

export const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  deliveryMethod: z.enum(["PICKUP", "DELIVERY"]),
  paymentMethod: z.enum(["PAYSTACK", "BANK_TRANSFER"]),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.deliveryMethod === "DELIVERY") {
      return !!data.street && !!data.city && !!data.state;
    }
    return true;
  },
  {
    message: "Address is required for delivery",
    path: ["street"],
  }
);

export type CheckoutInput = z.infer<typeof checkoutSchema>;
