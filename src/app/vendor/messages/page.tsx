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
  customer: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
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
  bookingIds: string[];
}

function getUnread(key: string, total: number): number {
  try {
    const seen = Number(localStorage.getItem(`hh_seen_${key}`) ?? 0);
    return Math.max(0, total - seen);
  } catch { return 0; }
}

export default function VendorMessagesPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isDesktop = useBreakpointValue({ base: false, md: true }, { fallback: "base" });

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        const bookings: ApiBooking[] = data.bookings ?? [];
        const byPerson = new Map<string, {
          name: string; avatarUrl?: string | null; customerId: string;
          totalMessages: number; totalUnread: number;
          latestText: string; latestTime: string; bookingIds: string[];
        }>();

        for (const b of bookings) {
          const uid = b.customer.id;
          const existing = byPerson.get(uid);
          const msgCount = b._count.messages;
          const unread = getUnread(uid, msgCount);
          const latestMsg = b.messages[0];

          if (!existing) {
            byPerson.set(uid, {
              name: `${b.customer.firstName} ${b.customer.lastName}`,
              avatarUrl: b.customer.avatarUrl,
              customerId: uid,
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
            id: p.customerId,
            name: p.name,
            lastMessage: p.latestText,
            time: p.latestTime || undefined,
            unread: p.totalUnread,
            href: `/vendor/messages/${p.customerId}`,
            avatarUrl: p.avatarUrl,
            bookingIds: p.bookingIds,
          }));

        setChats(chatList);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedChat = chats.find((c) => c.id === selectedId);

  const handleSelectChat = (chatId: string) => {
    if (isDesktop) {
      setSelectedId(chatId);
    } else {
      router.push(`/vendor/messages/${chatId}`);
    }
  };

  if (loading) {
    return (
      <Box pt="80px" textAlign="center" color="gray.400">
        Loading conversations…
      </Box>
    );
  }

  if (chats.length === 0) {
    return (
      <Box py="80px" px="28px" textAlign="center" color="gray.400">
        <Text fontSize="32px" mb="8px">💬</Text>
        <Text fontWeight="600">No conversations yet</Text>
        <Text fontSize="13px" mt="4px">Conversations appear when customers message you</Text>
      </Box>
    );
  }

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
              subtitle="Customer"
              chatUserId={selectedChat.id}
              bookingIds={selectedChat.bookingIds}
              quickReplies={QUICK_REPLIES}
              avatarSrc={selectedChat.avatarUrl ?? null}
              profileHref={`/vendor/customers/${selectedChat.id}`}
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

  return <ChatList chats={chats} onSelectChat={handleSelectChat} />;
}
