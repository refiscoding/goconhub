"use client";
import { useEffect, useState } from "react";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { QUICK_REPLIES } from "@/lib/constants";

interface PageProps { params: { chatId: string } }

interface BookingInfo {
  id: string;
  serviceName: string;
  vendorId: string;
  vendor: { userId: string; user: { firstName: string; lastName: string; avatarUrl?: string | null } };
}

export default function CustomerChatPage({ params }: PageProps) {
  const userId = params.chatId; // the vendor's user ID
  const [info, setInfo] = useState<{ name: string; avatarUrl?: string | null; vendorId?: string; bookingIds: string[] } | null>(null);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        const bookings: BookingInfo[] = (data.bookings ?? []).filter(
          (b: BookingInfo) => b.vendor.userId === userId,
        );
        if (bookings.length > 0) {
          const v = bookings[0].vendor;
          setInfo({
            name: `${v.user.firstName} ${v.user.lastName}`,
            avatarUrl: v.user.avatarUrl,
            vendorId: bookings[0].vendorId,
            bookingIds: bookings.map((b) => b.id),
          });
        }
      })
      .catch(() => {});
  }, [userId]);

  return (
    <div data-theme="customer" style={{ minHeight: "100vh" }}>
      <ChatRoom
        title={info?.name ?? "Vendor"}
        subtitle="Vendor"
        chatUserId={userId}
        bookingIds={info?.bookingIds}
        quickReplies={QUICK_REPLIES}
        backHref="/customer/messages"
        avatarSrc={info?.avatarUrl ?? null}
        profileHref={info?.vendorId ? `/customer/vendors/${info.vendorId}` : undefined}
      />
    </div>
  );
}
