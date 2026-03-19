import { describe, it, expect } from "vitest";
import { LoginSchema, RegisterSchema, CreateBookingSchema, CreateServiceSchema } from "@/lib/schemas";

describe("LoginSchema", () => {
  it("accepts valid input", () => {
    const result = LoginSchema.safeParse({ email: "test@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = LoginSchema.safeParse({ password: "password123" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = LoginSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = LoginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("RegisterSchema", () => {
  const valid = { email: "a@b.com", password: "12345678", firstName: "John", lastName: "Doe", role: "customer" };

  it("accepts valid input", () => {
    const result = RegisterSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 8 chars", () => {
    const result = RegisterSchema.safeParse({ ...valid, password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = RegisterSchema.safeParse({ ...valid, role: "admin" });
    expect(result.success).toBe(false);
  });

  it("trims firstName and lastName", () => {
    const result = RegisterSchema.safeParse({ ...valid, firstName: "  John  ", lastName: "  Doe  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.firstName).toBe("John");
      expect(result.data.lastName).toBe("Doe");
    }
  });

  it("rejects empty firstName", () => {
    const result = RegisterSchema.safeParse({ ...valid, firstName: "" });
    expect(result.success).toBe(false);
  });
});

describe("CreateBookingSchema", () => {
  const valid = { vendorId: "abc123", serviceName: "Plumbing", date: "2026-04-01", time: "10:00" };

  it("accepts valid input", () => {
    const result = CreateBookingSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects missing vendorId", () => {
    const result = CreateBookingSchema.safeParse({ ...valid, vendorId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = CreateBookingSchema.safeParse({ ...valid, amount: -100 });
    expect(result.success).toBe(false);
  });

  it("defaults location and note to empty string", () => {
    const result = CreateBookingSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.location).toBe("");
      expect(result.data.note).toBe("");
    }
  });
});

describe("CreateServiceSchema", () => {
  it("accepts valid input", () => {
    const result = CreateServiceSchema.safeParse({ name: "Fix Tap", price: 150 });
    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    const result = CreateServiceSchema.safeParse({ name: "Fix Tap", price: -10 });
    expect(result.success).toBe(false);
  });

  it("trims service name", () => {
    const result = CreateServiceSchema.safeParse({ name: "  Fix Tap  ", price: 100 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Fix Tap");
    }
  });

  it("defaults unit to hr", () => {
    const result = CreateServiceSchema.safeParse({ name: "Fix Tap", price: 100 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.unit).toBe("hr");
    }
  });
});
