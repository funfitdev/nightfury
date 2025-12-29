import { z } from "zod/v4";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
});

export const createUserInput = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
});

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInput>;
