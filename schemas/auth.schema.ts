import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(6, "Password minimum length should be 6 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;
