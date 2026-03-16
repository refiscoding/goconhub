"use client";
import { FC, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Toast, PageSpinner } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { AdminNav } from "@/components/layout/AdminNav";
import { OverviewTab }    from "./tabs/OverviewTab";
import { BookingsTab }    from "./tabs/BookingsTab";
import { VendorsTab }     from "./tabs/VendorsTab";
import { UsersTab }       from "./tabs/UsersTab";
import { DisputesTab }    from "./tabs/DisputesTab";
import { PaymentsTab }    from "./tabs/PaymentsTab";
import { CategoriesTab }  from "./tabs/CategoriesTab";
import { SettingsTab }    from "./tabs/SettingsTab";
import { MarketplaceTab } from "./tabs/MarketplaceTab";
import type { AppUser, Booking, Dispute, ListingOrder, UserStatus, DisputeStatus, AdminTab } from "@/lib/types";

interface RawBooking {
  id: string; serviceName: string; date: string; amount: number;
  status: string; completedByVendor: boolean; adminApprovedComplete: boolean;
  paymentStatus: string; paymentMethod: string | null; paymentReference: string | null; paidAt: string | null;
  customer: { id: string; firstName: string; lastName: string };
  vendor: { id: string; user: { firstName: string; lastName: string } };
}

export const AdminDash: FC = () => {
  const router = useRouter();
  const [tab,      setTab]     = useState<AdminTab>("overview");
  const [users,    setUsers]   = useState<AppUser[]>([]);
  const [bkgs,     setBkgs]    = useState<Booking[]>([]);
  const [rawBkgs,  setRawBkgs] = useState<RawBooking[]>([]);
  const [disps,    setDisps]   = useState<Dispute[]>([]);
  const [orders,   setOrders]  = useState<ListingOrder[]>([]);
  const [loading,  setLoading] = useState(true);
  const [toast, showToast] = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, bRes, dRes, mRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/bookings"),
        fetch("/api/admin/disputes"),
        fetch("/api/admin/listings"),
      ]);

      if (uRes.status === 403 || bRes.status === 403) {
        router.push("/admin");
        return;
      }

      const [uData, bData, dData, mData] = await Promise.all([uRes.json(), bRes.json(), dRes.json(), mRes.json()]);

      setUsers((uData.users ?? []).map((u: {
        id: string; firstName: string; lastName: string; email: string; phone: string | null;
        role: "customer" | "vendor"; status: UserStatus; createdAt: string;
        _count: { bookings: number };
        vendor?: { id: string; verified: boolean; entityType: string; idDocumentUrl: string; cipaDocumentUrl: string } | null;
      }) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        role: u.role,
        email: u.email,
        phone: u.phone ?? "",
        joined: new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        status: u.status,
        bookings: u._count.bookings,
        vendorId:        u.vendor?.id,
        verified:        u.vendor?.verified,
        entityType:      u.vendor?.entityType,
        idDocumentUrl:   u.vendor?.idDocumentUrl,
        cipaDocumentUrl: u.vendor?.cipaDocumentUrl,
      } satisfies AppUser)));

      const rawBookings: RawBooking[] = bData.bookings ?? [];
      setRawBkgs(rawBookings);
      setBkgs(rawBookings.map((b) => ({
        id: b.id,
        customer: `${b.customer.firstName} ${b.customer.lastName}`,
        vendor: `${b.vendor.user.firstName} ${b.vendor.user.lastName}`,
        service: b.serviceName ?? "—",
        date: b.date,
        time: "—",
        status: b.status as Booking["status"],
        amount: b.amount,
        loc: "—",
      } satisfies Booking)));

      setDisps((dData.disputes ?? []).map((d: {
        id: string; reason: string; status: string; createdAt: string;
        booking: { amount: number; customer: { firstName: string; lastName: string }; vendor: { user: { firstName: string; lastName: string } } };
      }) => ({
        id: d.id,
        customer: `${d.booking.customer.firstName} ${d.booking.customer.lastName}`,
        vendor: `${d.booking.vendor.user.firstName} ${d.booking.vendor.user.lastName}`,
        reason: d.reason,
        amount: d.booking.amount ?? 0,
        status: d.status as DisputeStatus,
        date: new Date(d.createdAt).toLocaleDateString("en-GB"),
      } satisfies Dispute)));

      setOrders((mData.orders ?? []).map((o: {
        id: string; status: string; note: string; createdAt: string;
        listing: { id: string; title: string; price: number };
        customer: { id: string; firstName: string; lastName: string };
      }) => ({
        id: o.id,
        listingId: o.listing.id,
        listingTitle: o.listing.title,
        listingPrice: o.listing.price,
        customerId: o.customer.id,
        customerName: `${o.customer.firstName} ${o.customer.lastName}`,
        note: o.note,
        status: o.status as ListingOrder["status"],
        createdAt: o.createdAt,
      } satisfies ListingOrder)));
    } catch {
      showToast("Failed to load data", "err");
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const vendors   = users.filter((u) => u.role === "vendor");
  const customers = users.filter((u) => u.role === "customer");
  const pendingV  = vendors.filter((v) => v.status === "pending").length;
  const openD     = disps.filter((d) => d.status === "open").length;
  const pendingPayments = rawBkgs.filter((b) =>
    (b.completedByVendor && !b.adminApprovedComplete) || b.paymentStatus === "submitted"
  ).length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const updateUserStatus = async (id: string, status: UserStatus) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
    showToast(status === "active" ? "User reactivated ✓" : "User suspended", status === "active" ? "ok" : "err");
  };

  const approveUser = (id: string) => updateUserStatus(id, "active");
  const suspendUser = (id: string) => updateUserStatus(id, "suspended");

  const verifyVendor = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify" }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, verified: true } : u));
      showToast("Vendor verified ✓", "ok");
    } else {
      showToast("Failed to verify vendor", "err");
    }
  };

  const deleteUser = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast("User deleted", "ok");
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.message ?? "Cannot delete user", "err");
    }
  };

  const resolveDisp = async (id: string) => {
    await fetch(`/api/admin/disputes/${id}`, { method: "PATCH" });
    setDisps((prev) => prev.map((d) => d.id === id ? { ...d, status: "resolved" } : d));
    showToast("Dispute resolved ✓", "ok");
  };

  const approveJobComplete = async (id: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminApprovedComplete: true }),
    });
    if (res.ok) {
      setRawBkgs((prev) => prev.map((b) => b.id === id ? { ...b, adminApprovedComplete: true } : b));
      showToast("Job completion approved — customer notified to pay ✓", "ok");
    } else showToast("Failed to approve", "err");
  };

  const confirmPayment = async (id: string) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: "confirmed" }),
    });
    if (res.ok) {
      setRawBkgs((prev) => prev.map((b) => b.id === id ? { ...b, paymentStatus: "confirmed", status: "completed" } : b));
      showToast("Payment confirmed — vendor notified ✓", "ok");
    } else showToast("Failed to confirm payment", "err");
  };

  const approveOrder = async (id: string) => {
    const res = await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "approved" }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) =>
        o.id === id ? { ...o, status: "approved" } :
        o.listingId === prev.find((x) => x.id === id)?.listingId ? { ...o, status: "rejected" } : o
      ));
      showToast("Order approved ✓", "ok");
    } else showToast("Failed to approve", "err");
  };

  const rejectOrder = async (id: string) => {
    const res = await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "rejected" }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "rejected" } : o));
      showToast("Order rejected", "ok");
    } else showToast("Failed to reject", "err");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <div data-theme="admin" className="app-shell">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <AdminNav
        tab={tab}
        onTabChange={(t) => setTab(t as AdminTab)}
        pendingVendors={pendingV}
        openDisputes={openD}
        pendingPayments={pendingPayments}
        pendingOrders={pendingOrders}
        onLogout={handleLogout}
      />
      <main className="app-content">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
          {loading ? (
            <PageSpinner paddingY="80px" />
          ) : (
            <>
              {tab === "overview"  && <OverviewTab  bookings={bkgs} disputes={disps} vendorCount={vendors.length} customerCount={customers.length} pendingVendors={pendingV} />}
              {tab === "bookings"  && <BookingsTab  bookings={bkgs} />}
              {tab === "payments"  && <PaymentsTab  bookings={rawBkgs} onApproveComplete={approveJobComplete} onConfirmPayment={confirmPayment} />}
              {tab === "vendors"    && <VendorsTab    vendors={vendors}     onApprove={approveUser} onSuspend={suspendUser} onDelete={deleteUser} onVerify={verifyVendor} />}
              {tab === "users"      && <UsersTab      customers={customers} onApprove={approveUser} onSuspend={suspendUser} onDelete={deleteUser} />}
              {tab === "disputes"   && <DisputesTab   disputes={disps} onResolve={resolveDisp} />}
              {tab === "categories"  && <CategoriesTab />}
              {tab === "settings"    && <SettingsTab />}
              {tab === "marketplace" && <MarketplaceTab orders={orders} onApprove={approveOrder} onReject={rejectOrder} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
