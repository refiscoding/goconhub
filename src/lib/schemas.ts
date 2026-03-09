import { z } from "zod";

/* ── Auth ─────────────────────────────────────────────────────────── */

export const LoginSchema = z.object({
  email:    z.string().email("Invalid email address.").max(254),
  password: z.string().min(1, "Password is required.").max(256),
});

export const RegisterSchema = z.object({
  email:     z.string().email("Invalid email address.").max(254),
  password:  z.string()
               .min(8,  "Password must be at least 8 characters.")
               .max(256, "Password is too long."),
  firstName: z.string().min(1).max(100).transform((s) => s.trim()),
  lastName:  z.string().min(1).max(100).transform((s) => s.trim()),
  role:      z.enum(["customer", "vendor"], { message: "Invalid role." }),
});

/* ── Bookings ─────────────────────────────────────────────────────── */

export const CreateBookingSchema = z.object({
  vendorId:    z.string().min(1, "vendorId is required."),
  serviceId:   z.string().optional(),
  serviceName: z.string().min(1).max(200),
  date:        z.string().min(1, "date is required."),
  time:        z.string().min(1, "time is required."),
  location:    z.string().max(300).optional().default(""),
  note:        z.string().max(1000).optional().default(""),
  amount:      z.number().positive().optional(),
});

/* ── Services ─────────────────────────────────────────────────────── */

export const CreateServiceSchema = z.object({
  name:   z.string().min(1, "name is required.").max(100).transform((s) => s.trim()),
  price:  z.number().positive("price must be a positive number."),
  unit:   z.enum(["hr", "job", "day"]).optional().default("hr"),
  desc:   z.string().max(1000).optional().default(""),
  active: z.boolean().optional().default(true),
});

/* ── Admin ────────────────────────────────────────────────────────── */

export const UpdateUserStatusSchema = z.object({
  status: z.enum(["active", "suspended", "pending"], { message: "Invalid status." }),
});
