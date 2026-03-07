"use client";
import { useEffect, useState } from "react";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { QUICK_REPLIES } from "@/lib/constants";

interface PageProps { params: { chatId: string } }

interface BookingInfo {
  id: string;
  serviceName: string;
  vendorId: string;
  vendor: { user: { firstName: string; lastName: string; avatarUrl?: string | null } };
}

export default function CustomerChatPage({ params }: PageProps) {
  const { chatId } = params;
  const [booking, setBooking] = useState<BookingInfo | null>(null);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        const found = (data.bookings ?? []).find((b: BookingInfo) => b.id === chatId);
        if (found) setBooking(found);
      })
      .catch(() => {});
  }, [chatId]);

  const vendorName = booking
    ? `${booking.vendor.user.firstName} ${booking.vendor.user.lastName}`
    : "Vendor";

  return (
    <div data-theme="customer" style={{ minHeight: "100vh" }}>
      <ChatRoom
        title={vendorName}
        subtitle="Vendor"
        banner={booking ? `📋 ${booking.serviceName}` : undefined}
        bookingId={chatId}
        quickReplies={QUICK_REPLIES}
        backHref="/customer/messages"
        avatarSrc={booking?.vendor.user.avatarUrl ?? null}
        profileHref={booking ? `/customer/vendors/${booking.vendorId}` : undefined}
      />
    </div>
  );
}
