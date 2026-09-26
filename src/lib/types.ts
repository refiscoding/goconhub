// ── Primitive types ─────────────────────────────────────────────────────────
export type Role           = "customer" | "vendor" | "admin";
export type AuthMode       = "login" | "register";
export type BookingStatus  = "pending" | "confirmed" | "completed" | "declined";
export type UserStatus     = "active" | "pending" | "suspended";
export type DisputeStatus  = "open" | "resolved";
export type ServiceUnit    = "hr" | "job" | "day";
export type ToastType      = "ok" | "err" | "info";
export type AdminTab       = "overview" | "bookings" | "payments" | "vendors" | "users" | "disputes" | "categories" | "settings" | "marketplace" | "support";
export type TicketStatus   = "open" | "in_progress" | "resolved";
export type ListingStatus  = "active" | "sold" | "removed";
export type OrderStatus    = "pending" | "approved" | "rejected";
export type MessageSender  = "me" | "them";

// ── Domain models ────────────────────────────────────────────────────────────
export interface Vendor {
  id: string;
  name: string;
  cat: string;
  loc: string;
  rating: number;
  rev: number;
  price: number;
  unit: ServiceUnit;
  avail: boolean;
  verified?: boolean;
  tags: string[];
  bio: string;
  avatarUrl?: string | null;
  services?: { id: string | null; name: string; price: number; unit: ServiceUnit }[];
}

export interface Booking {
  id: string;
  customer: string;
  vendor: string;
  service: string;
  date: string;
  time: string;
  status: BookingStatus;
  amount: number;
  loc: string;
  issueDesc?: string;
  photos?: string[];
}

export interface AppUser {
  id: string;
  name: string;
  role: "customer" | "vendor";
  email: string;
  phone: string;
  joined: string;
  status: UserStatus;
  bookings: number;
  // vendor-only fields
  vendorId?: string;
  verified?: boolean;
  entityType?: string;
  idDocumentUrl?: string;
  cipaDocumentUrl?: string;
  companyName?: string;
  companyRegNumber?: string;
  bankName?: string;
  accountNumber?: string;
  category?: string;
  location?: string;
}

export interface Dispute {
  id: string;
  customer: string;
  vendor: string;
  reason: string;
  amount: number;
  status: DisputeStatus;
  date: string;
}

export interface Message {
  id: number | string;
  from: MessageSender;
  text: string;
  time: string;
  createdAt?: string;
}

export interface VendorService {
  id: number;
  name: string;
  price: number;
  unit: ServiceUnit;
  desc: string;
  active: boolean;
}

export interface Listing {
  id: string;
  title: string;
  desc: string;
  price: number;
  condition: string;
  photos: string[];
  status: ListingStatus;
  vendorId: string;
  vendorName: string;
  vendorAvatar?: string | null;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  role: string;
  issueType: string;
  message: string;
  status: TicketStatus;
  adminNote: string;
  createdAt: string;
}

export interface ListingOrder {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  customerName: string;
  customerId: string;
  note: string;
  status: OrderStatus;
  createdAt: string;
}

// ── UI / form models ──────────────────────────────────────────────────────────
export interface ServiceDraft {
  id: number;
  name: string;
  price: string;
  unit: ServiceUnit;
  desc: string;
  active: boolean;
}

export interface SelectedService {
  id?: string | null;
  name: string;
  price: number;
}

export interface SelectedDate {
  label: string;
  short: string;
}

export interface BookingSelection {
  service: SelectedService | null;
  date: SelectedDate | null;
  time: string | null;
  note: string;
  issueDesc: string;
  photos: File[];
}

export interface ProfileData {
  fn: string;
  ln: string;
  email: string;
  phone: string;
  city: string;
  area: string;
  bio: string;
  cat?: string;
}

export interface ToastState {
  msg: string;
  type: ToastType;
}

export interface Conversation {
  id: number;
  vendor: Vendor;
  msgs: Message[];
  unread: number;
}

export interface VendorConvo {
  id: number;
  customer: string;
  bookingId: number;
  msgs: Message[];
  unread: number;
}

export interface CustOnboardData {
  fn: string;
  ln: string;
  phone: string;
  city: string;
  area: string;
  services: string[];
}

export interface VendorOnboardData {
  fn: string;
  ln: string;
  phone: string;
  city: string;
  area: string;
  bio: string;
  cat: string;
  skills: string[];
  // Verification
  entityType: "individual" | "company";
  idNumber: string;
  bankName: string;
  accountNumber: string;
  companyName: string;
  companyRegNumber: string;
}
