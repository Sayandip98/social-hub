import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email or username is required"),

  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(50, "Full name too long"),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),

  email: z.string().min(1, "Email is required").email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),
});

export const updateProfileSchema = z.object({
  fullName: z.string().max(50, "Full name too long").optional(),

  bio: z.string().max(150, "Bio too long").optional(),

  website: z.string().url("Invalid URL").optional().or(z.literal("")),

  gender: z.enum(["male", "female", "prefer_not_to_say"]).optional(),
});

export const commentSchema = z.object({
  text: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment too long"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),

  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
