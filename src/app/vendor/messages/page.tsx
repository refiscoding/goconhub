"use client";
import { useEffect, useState } from "react";
import { ChatList } from "@/components/chat/ChatList";

interface ApiBooking {
  id: string;
  serviceName: string;
  status: string;
  customer: { firstName: string; lastName: string };
  _count: { messages: number };
}

function getUnread(bookingId: string, total: number): number {
  try {
    const seen = Number(localStorage.getItem(`hh_seen_${bookingId}`) ?? 0);
    return Math.max(0, total - seen);
  } catch { return 0; }
}

export default function VendorMessagesPage() {
  const [chats, setChats] = useState<{ id: string; name: string; lastMessage: string; unread: number; href: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        const bookings: ApiBooking[] = data.bookings ?? [];
        setChats(bookings.map((b) => ({
          id:          b.id,
          name:        `${b.customer.firstName} ${b.customer.lastName}`,
          lastMessage: `${b.serviceName} · ${b.status}`,
          unread:      getUnread(b.id, b._count.messages),
          href:        `/vendor/messages/${b.id}`,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ paddingTop: 80, textAlign: "center", color: "var(--ink3)" }}>
        Loading conversations…
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div style={{ padding: "80px 28px", textAlign: "center", color: "var(--ink3)" }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
        <p style={{ fontWeight: 600 }}>No conversations yet</p>
        <p style={{ fontSize: 13, marginTop: 4 }}>Conversations appear when customers book you</p>
      </div>
    );
  }

  return <ChatList chats={chats} />;
}
