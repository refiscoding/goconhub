"use client";
import { useEffect, useState } from "react";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { QUICK_REPLIES } from "@/lib/constants";

interface PageProps {
  params: { chatId: string };
}

interface BookingInfo {
  id: string;
  serviceName: string;
  customer: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

export default function VendorChatPage({ params }: PageProps) {
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

  const customerName = booking
    ? `${booking.customer.firstName} ${booking.customer.lastName}`
    : "Customer";

  return (
    <div data-theme="vendor" style={{ minHeight: "100vh" }}>
      <ChatRoom
        title={customerName}
        subtitle="Customer"
        banner={booking ? `📋 ${booking.serviceName} — tap ⚡ for quick replies` : undefined}
        bookingId={chatId}
        quickReplies={QUICK_REPLIES}
        backHref="/vendor/messages"
        avatarSrc={booking?.customer.avatarUrl ?? null}
        profileHref={booking ? `/vendor/customers/${booking.customer.id}` : undefined}
      />
    </div>
  );
}
