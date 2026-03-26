"use client";
import { useEffect, useState } from "react";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { QUICK_REPLIES } from "@/lib/constants";

interface PageProps { params: { chatId: string } }

interface BookingInfo {
  id: string;
  serviceName: string;
  customer: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

export default function VendorChatPage({ params }: PageProps) {
  const userId = params.chatId; // the customer's user ID
  const [info, setInfo] = useState<{ name: string; avatarUrl?: string | null; bookingIds: string[] } | null>(null);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        const bookings: BookingInfo[] = (data.bookings ?? []).filter(
          (b: BookingInfo) => b.customer.id === userId,
        );
        if (bookings.length > 0) {
          const c = bookings[0].customer;
          setInfo({
            name: `${c.firstName} ${c.lastName}`,
            avatarUrl: c.avatarUrl,
            bookingIds: bookings.map((b) => b.id),
          });
        }
      })
      .catch(() => {});
  }, [userId]);

  return (
    <div data-theme="vendor" style={{ minHeight: "100vh" }}>
      <ChatRoom
        title={info?.name ?? "Customer"}
        subtitle="Customer"
        chatUserId={userId}
        bookingIds={info?.bookingIds}
        quickReplies={QUICK_REPLIES}
        backHref="/vendor/messages"
        avatarSrc={info?.avatarUrl ?? null}
        profileHref={userId ? `/vendor/customers/${userId}` : undefined}
      />
    </div>
  );
}
