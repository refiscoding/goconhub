"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Text, useBreakpointValue } from "@chakra-ui/react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { QUICK_REPLIES } from "@/lib/constants";

interface ApiBooking {
  id: string;
  serviceName: string;
  status: string;
  vendorId: string;
  vendor: { id: string; userId: string; user: { firstName: string; lastName: string; avatarUrl?: string | null } };
  _count: { messages: number };
  messages: { createdAt: string; text: string }[];
}

interface ChatPreview {
  id: string;
  name: string;
  lastMessage: string;
  time?: string;
  unread: number;
  href: string;
  avatarUrl?: string | null;
  vendorId?: string;
  bookingIds: string[];
}

function getUnread(key: string, total: number): number {
  try {
    const raw = localStorage.getItem(`hh_seen_${key}`);
    if (raw === null) return total; // never opened = all unread
    return Math.max(0, total - Number(raw));
  } catch { return total; }
}

export default function CustomerMessagesPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isDesktop = useBreakpointValue({ base: false, md: true }, { fallback: "base" });

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        const bookings: ApiBooking[] = data.bookings ?? [];
        const byPerson = new Map<string, {
          name: string; avatarUrl?: string | null; vendorUserId: string; vendorId: string;
          totalMessages: number; totalUnread: number;
          latestText: string; latestTime: string; bookingIds: string[];
        }>();

        for (const b of bookings) {
          const uid = b.vendor.userId;
          const existing = byPerson.get(uid);
          const msgCount = b._count.messages;
          const unread = getUnread(uid, msgCount);
          const latestMsg = b.messages[0];

          if (!existing) {
            byPerson.set(uid, {
              name: `${b.vendor.user.firstName} ${b.vendor.user.lastName}`,
              avatarUrl: b.vendor.user.avatarUrl,
              vendorUserId: uid,
              vendorId: b.vendorId,
              totalMessages: msgCount,
              totalUnread: unread,
              latestText: latestMsg?.text ?? "",
              latestTime: latestMsg?.createdAt ?? "",
              bookingIds: [b.id],
            });
          } else {
            existing.totalMessages += msgCount;
            existing.totalUnread += unread;
            existing.bookingIds.push(b.id);
            if (latestMsg && latestMsg.createdAt > existing.latestTime) {
              existing.latestText = latestMsg.text;
              existing.latestTime = latestMsg.createdAt;
            }
          }
        }

        const chatList: ChatPreview[] = Array.from(byPerson.values())
          .filter((p) => p.totalMessages > 0)
          .sort((a, b) => (b.latestTime > a.latestTime ? 1 : -1))
          .map((p) => ({
            id: p.vendorUserId,
            name: p.name,
            lastMessage: p.latestText,
            time: p.latestTime || undefined,
            unread: p.totalUnread,
            href: `/customer/messages/${p.vendorUserId}`,
            avatarUrl: p.avatarUrl,
            vendorId: p.vendorId,
            bookingIds: p.bookingIds,
          }));

        setChats(chatList);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  const selectedChat = chats.find((c) => c.id === selectedId);

  const handleSelectChat = (chatId: string) => {
    if (isDesktop) {
      setSelectedId(chatId);
    } else {
      router.push(`/customer/messages/${chatId}`);
    }
  };

  if (loading) {
    return (
      <Box pt="80px" textAlign="center" color="gray.400">
        Loading conversations…
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box py="80px" px="28px" textAlign="center" color="gray.400">
        <Text fontSize="32px" mb="8px">⚠️</Text>
        <Text fontWeight="600">Failed to load conversations</Text>
        <Text fontSize="13px" mt="4px">Please check your connection and try again</Text>
      </Box>
    );
  }

  if (chats.length === 0) {
    return (
      <Box py="80px" px="28px" textAlign="center" color="gray.400">
        <Text fontSize="32px" mb="8px">💬</Text>
        <Text fontWeight="600">No conversations yet</Text>
        <Text fontSize="13px" mt="4px">Book a handyman to start messaging</Text>
      </Box>
    );
  }

  // Desktop: split pane layout
  if (isDesktop) {
    return (
      <Flex h="calc(100vh - 60px)" overflow="hidden">
        <Box w="360px" borderRight="1px solid" borderColor="gray.200" flexShrink={0}>
          <ChatList chats={chats} activeChatId={selectedId ?? undefined} onSelectChat={handleSelectChat} />
        </Box>
        <Box flex="1" bg="gray.50">
          {selectedChat ? (
            <ChatRoom
              key={selectedChat.id}
              title={selectedChat.name}
              subtitle="Vendor"
              chatUserId={selectedChat.id}
              bookingIds={selectedChat.bookingIds}
              quickReplies={QUICK_REPLIES}
              avatarSrc={selectedChat.avatarUrl ?? null}
              profileHref={selectedChat.vendorId ? `/customer/vendors/${selectedChat.vendorId}` : undefined}
              embedded
            />
          ) : (
            <Flex h="100%" align="center" justify="center" direction="column" color="gray.400">
              <Text fontSize="48px" mb="12px">💬</Text>
              <Text fontWeight="600" fontSize="18px">Select a conversation</Text>
              <Text fontSize="14px" mt="4px">Choose from your existing conversations</Text>
            </Flex>
          )}
        </Box>
      </Flex>
    );
  }

  // Mobile: chat list only (tapping navigates to chat room page)
  return <ChatList chats={chats} onSelectChat={handleSelectChat} />;
}
